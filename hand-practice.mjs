import { classifySign } from './sign-classifier.mjs';
import { classifyMotion } from './sign-motion.mjs';
import { classifyVocabularyMotion } from './vocabulary-gesture.mjs';
import { vocabularyReferences } from './vocabulary-references.mjs';

const stableSamples = 3;
const maxSampleGap = 600;
const motionLeadTime = 900;
const motionDuration = 3500;

function drawHands(canvas, video, hands, connections) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!hands.length) return;
  const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 320);
  context.lineWidth = 2 * scale;
  context.strokeStyle = '#fff2dc';
  context.fillStyle = '#f2bd82';
  context.shadowColor = '#3a2d31';
  context.shadowBlur = 3 * scale;

  for (const landmarks of hands) {
    const points = landmarks.map(({ x, y }) => [x * canvas.width, y * canvas.height]);
    context.beginPath();
    for (const { start, end } of connections) {
      context.moveTo(...points[start]);
      context.lineTo(...points[end]);
    }
    context.stroke();
    for (const [x, y] of points) {
      context.beginPath();
      context.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
      context.fill();
    }
  }
}

export function startHandPractice({ video, canvas, status, letter, vocabulary = false, motionButton, onMatch, onAttempt }) {
  const frameInterval = motionButton ? 65 : 100;
  let worker;
  let timer;
  let motionTimer;
  let motionCapture = null;
  let motionState = 'idle';
  let stopped = false;
  let videoTime = -1;
  let lastFrameAt = 0;
  let connections = [];
  let candidate = null;
  let samples = 0;
  let lastResultAt = -Infinity;

  function show(message) {
    if (status.textContent !== message) status.textContent = message;
  }

  function stop() {
    stopped = true;
    clearTimeout(timer);
    clearTimeout(motionTimer);
    motionCapture = null;
    if (motionButton) {
      motionButton.removeEventListener('click', startMotionAttempt);
      motionButton.disabled = true;
      motionButton.textContent = 'Evaluar movimiento';
    }
    worker?.terminate();
    canvas.hidden = true;
    canvas.width = 1;
    canvas.height = 1;
  }

  function fail() {
    if (stopped) return;
    stop();
    show('No se pudo iniciar o continuar el reconocimiento. Puedes usar la vista de cámara o apagarla y volver a intentar.');
  }

  function requestFrame(delay = frameInterval) {
    if (!stopped) timer = setTimeout(sendFrame, delay);
  }

  async function sendFrame() {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.currentTime === videoTime) {
      requestFrame();
      return;
    }
    videoTime = video.currentTime;
    lastFrameAt = performance.now();
    let bitmap;
    try {
      bitmap = await createImageBitmap(video);
      if (stopped) {
        bitmap.close();
        return;
      }
      worker.postMessage({ type: 'frame', bitmap, timestamp: lastFrameAt }, [bitmap]);
      timer = setTimeout(fail, 4000);
    } catch {
      bitmap?.close();
      if (!stopped) fail();
    }
  }

  function showPrediction(prediction) {
    if (vocabulary) {
      show(prediction === letter ? 'La seña coincide con la muestra.' : 'Se detectó otra seña. Revisa la muestra y vuelve a intentar.');
    } else if (prediction === letter) {
      show(`Letra ${prediction} detectada. Coincide con la referencia.`);
    } else {
      show(`Letra ${prediction} detectada. Practica la letra ${letter} de esta ficha.`);
    }
  }

  function finishMotionAttempt() {
    const { frames } = motionCapture;
    motionCapture = null;
    motionState = 'result';
    motionButton.disabled = false;
    motionButton.textContent = 'Evaluar otro intento';
    if (frames.length < 8) {
      show(vocabulary ? 'Mantén visibles las manos durante el movimiento y vuelve a intentar.' : 'Mantén una sola mano visible durante todo el movimiento y vuelve a intentar.');
      return;
    }
    const aspect = video.videoWidth / video.videoHeight;
    const prediction = vocabulary ? classifyVocabularyMotion(frames, aspect, vocabularyReferences) : classifyMotion(frames, aspect);
    if (!prediction) {
      show('No se pudo identificar el movimiento. Revisa el video y vuelve a intentar.');
      return;
    }
    showPrediction(prediction);
    if (prediction === letter) onMatch();
  }

  function startMotionAttempt() {
    onAttempt();
    motionState = 'preparing';
    motionButton.disabled = true;
    motionButton.textContent = 'Prepárate…';
    show('Coloca tu mano en la posición inicial.');
    motionTimer = setTimeout(() => {
      motionState = 'recording';
      motionCapture = { startedAt: performance.now(), frames: [] };
      motionButton.textContent = 'Evaluando…';
      show(vocabulary ? 'Haz la seña una vez y mantén las manos visibles.' : 'Haz el movimiento una vez y mantén tu mano visible hasta el final.');
      motionTimer = setTimeout(finishMotionAttempt, vocabulary ? 4500 : motionDuration);
    }, motionLeadTime);
  }

  function updateMotionResult(hand, worldHand) {
    if (motionCapture && hand && worldHand && lastFrameAt >= motionCapture.startedAt) {
      motionCapture.frames.push({ landmarks: hand, worldLandmarks: worldHand, timestamp: lastFrameAt });
    }
    if (motionState !== 'idle') return;
    if (hand) show('Mano detectada. Pulsa Evaluar movimiento cuando estés listo.');
    else show('Coloca una mano dentro del encuadre.');
  }

  function updateStaticResult(hand, worldHand, handCount) {
    const prediction = hand ? classifySign(hand, worldHand, video.videoWidth / video.videoHeight) : null;
    const now = performance.now();
    samples = prediction && prediction === candidate && now - lastResultAt <= maxSampleGap ? samples + 1 : 1;
    candidate = prediction;
    lastResultAt = now;

    if (handCount > 1) {
      show('Muestra una sola mano.');
    } else if (!hand) {
      show('Coloca una mano dentro del encuadre.');
    } else if (!prediction) {
      show('Mano detectada. No se pudo identificar la letra.');
    } else if (samples < stableSamples) {
      show('Mano detectada. Mantén la seña un momento.');
    } else {
      showPrediction(prediction);
      if (prediction === letter && samples === stableSamples) onMatch();
    }
  }

  function updateResult(landmarks, worldLandmarks) {
    const hand = landmarks.length === 1 ? landmarks[0] : null;
    if (vocabulary) {
      drawHands(canvas, video, landmarks, connections);
      if (motionCapture && landmarks.length && lastFrameAt >= motionCapture.startedAt) {
        motionCapture.frames.push({ landmarks, worldLandmarks, timestamp: lastFrameAt });
      }
      if (motionState === 'idle') show(landmarks.length ? 'Manos en el encuadre. Pulsa Evaluar movimiento.' : 'Coloca las manos en el encuadre.');
      return;
    }
    drawHands(canvas, video, hand ? landmarks : [], connections);
    if (motionButton) updateMotionResult(hand, worldLandmarks[0]);
    else updateStaticResult(hand, worldLandmarks[0], landmarks.length);
  }

  show('Cargando reconocimiento del abecedario…');
  try {
    worker = new Worker(new URL('./hand-worker.js', import.meta.url));
    worker.addEventListener('error', event => {
      event.preventDefault();
      fail();
    });
    worker.addEventListener('messageerror', fail);
    worker.addEventListener('message', ({ data }) => {
      if (stopped) return;
      clearTimeout(timer);
      if (data.type === 'ready') {
        connections = data.connections;
        canvas.hidden = false;
        if (motionButton) {
          motionButton.disabled = false;
          motionButton.addEventListener('click', startMotionAttempt);
        }
        show('Coloca una mano dentro del encuadre.');
        requestFrame(0);
      } else if (data.type === 'result') {
        updateResult(data.landmarks, data.worldLandmarks);
        requestFrame(Math.max(0, frameInterval - (performance.now() - lastFrameAt)));
      } else {
        fail();
      }
    });
    worker.postMessage({ type: 'init', singleHand: Boolean(motionButton && !vocabulary), vocabulary });
    timer = setTimeout(fail, 20000);
  } catch {
    fail();
  }
  return stop;
}
