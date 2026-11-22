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

function isLetterSign(value) {
  return typeof value === 'string' && /^[A-ZÑ]$/u.test(value);
}

function isNumberSign(value) {
  return typeof value === 'string' && /^(?:[1-9]|10)$/u.test(value);
}

export function startHandPractice({ letter, ...options }) {
  if (!isLetterSign(letter)) throw new RangeError('La práctica requiere una letra del abecedario.');
  return startPractice(options, letter, false);
}

export function startNumberPractice({ number, ...options }) {
  if (!isNumberSign(number)) throw new RangeError('La práctica requiere un número del 1 al 10.');
  return startPractice(options, number, true);
}

function startPractice({ video, canvas, status, motionButton, onMatch, onAttempt, handCount = 1 }, sign, numberPractice) {
  const subject = numberPractice ? 'número' : 'letra';
  const accepts = numberPractice ? isNumberSign : isLetterSign;
  const framing = handCount === 2 ? 'ambas manos' : 'una sola mano';
  const frameInterval = motionButton ? 65 : 100;
  let classify;
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
    if (numberPractice) {
      show(prediction === sign
        ? `Número ${sign} detectado. Coincide con la referencia.`
        : `La seña no coincide con el número ${sign}. Revisa la referencia y vuelve a intentar.`);
    } else if (prediction === sign) {
      show(`Letra ${prediction} detectada. Coincide con la referencia.`);
    } else {
      show(`Letra ${prediction} detectada. Practica la letra ${sign} de esta ficha.`);
    }
  }

  function finishMotionAttempt() {
    const { frames } = motionCapture;
    motionCapture = null;
    motionState = 'result';
    motionButton.disabled = false;
    motionButton.textContent = 'Evaluar otro intento';
    if (frames.filter(frame => !numberPractice || frame.landmarks.length === handCount).length < 8) {
      show(`Mantén ${framing} ${handCount === 2 ? 'visibles' : 'visible'} durante todo el movimiento y vuelve a intentar.`);
      return;
    }
    const aspect = video.videoWidth / video.videoHeight;
    const prediction = classify(frames, aspect);
    if (!accepts(prediction)) {
      show(numberPractice
        ? 'No se pudo identificar el movimiento. Revisa la referencia y vuelve a intentar.'
        : 'No se pudo identificar el movimiento. Revisa el video y vuelve a intentar.');
      return;
    }
    showPrediction(prediction);
    if (prediction === sign) onMatch();
  }

  function startMotionAttempt() {
    onAttempt();
    motionState = 'preparing';
    motionButton.disabled = true;
    motionButton.textContent = 'Prepárate…';
    show(handCount === 2 ? 'Coloca las manos en la posición inicial.' : 'Coloca tu mano en la posición inicial.');
    motionTimer = setTimeout(() => {
      motionState = 'recording';
      motionCapture = { startedAt: performance.now(), frames: [] };
      motionButton.textContent = 'Evaluando…';
      show(numberPractice ? 'Haz la seña completa como en la referencia y mantén el encuadre.' :
        'Haz el movimiento una vez y mantén tu mano visible hasta el final.');
      motionTimer = setTimeout(finishMotionAttempt, numberPractice ? 5000 : motionDuration);
    }, motionLeadTime);
  }

  function updateMotionResult(frame, hand, worldHand) {
    if (motionCapture && lastFrameAt >= motionCapture.startedAt) {
      if (numberPractice) motionCapture.frames.push(frame);
      else if (hand && worldHand) {
        motionCapture.frames.push({ landmarks: hand, worldLandmarks: worldHand, timestamp: lastFrameAt });
      }
    }
    if (motionState !== 'idle') return;
    if (frame.landmarks.length === handCount) {
      show(`${handCount === 2 ? 'Manos detectadas' : 'Mano detectada'}. Pulsa Evaluar movimiento cuando estés listo.`);
    } else {
      show(`Coloca ${numberPractice ? framing : 'una mano'} dentro del encuadre.`);
    }
  }

  function updateStaticResult(frame, hand) {
    const aspect = video.videoWidth / video.videoHeight;
    const result = hand ? classify(frame, aspect) : null;
    const prediction = accepts(result) ? result : null;
    const now = performance.now();
    samples = prediction && prediction === candidate && now - lastResultAt <= maxSampleGap ? samples + 1 : 1;
    candidate = prediction;
    lastResultAt = now;

    if (frame.landmarks.length > 1) {
      show('Muestra una sola mano.');
    } else if (!hand) {
      show('Coloca una mano dentro del encuadre.');
    } else if (!prediction) {
      show(`Mano detectada. No se pudo identificar ${numberPractice ? 'el' : 'la'} ${subject}.`);
    } else if (samples < stableSamples) {
      show('Mano detectada. Mantén la seña un momento.');
    } else {
      showPrediction(prediction);
      if (prediction === sign && samples === stableSamples) onMatch();
    }
  }

  function updateResult({ landmarks, worldLandmarks, handedness }) {
    const frame = { landmarks, worldLandmarks, handedness, timestamp: lastFrameAt };
    const hand = landmarks.length === 1 ? landmarks[0] : null;
    drawHands(canvas, video, numberPractice ? landmarks : hand ? [hand] : [], connections);
    if (motionButton) updateMotionResult(frame, hand, worldLandmarks[0]);
    else updateStaticResult(frame, hand);
  }

  async function initialize() {
    if (numberPractice) {
      const [{ createNumberClassifier }, { numberGestureReferences }] = await Promise.all([
        import('./number-classifier.mjs'), import('./number-gesture-references.mjs'),
      ]);
      const activeReferences = Object.fromEntries(Object.entries(numberGestureReferences).filter(([key]) => isNumberSign(key)));
      const classifier = createNumberClassifier(activeReferences);
      classify = motionButton ? classifier.classifyMotion : classifier.classifyStatic;
    } else if (motionButton) {
      ({ classifyMotion: classify } = await import('./sign-motion.mjs'));
    } else {
      const { classifySign } = await import('./sign-classifier.mjs');
      classify = ({ landmarks, worldLandmarks }, aspect) => classifySign(landmarks[0], worldLandmarks[0], aspect);
    }
    if (stopped) return;
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
        show(`Coloca ${numberPractice ? framing : 'una mano'} dentro del encuadre.`);
        requestFrame(0);
      } else if (data.type === 'result') {
        updateResult(data);
        requestFrame(Math.max(0, frameInterval - (performance.now() - lastFrameAt)));
      } else {
        fail();
      }
    });
    worker.postMessage({ type: 'init', singleHand: !numberPractice && Boolean(motionButton) });
    timer = setTimeout(fail, 20000);
  }
  show(`Cargando reconocimiento ${numberPractice ? 'de números' : 'del abecedario'}…`);
  void initialize().catch(fail);
  return stop;
}
