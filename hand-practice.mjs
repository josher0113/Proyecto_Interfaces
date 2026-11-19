import { classifySign } from './sign-classifier.mjs';

const frameInterval = 100;
const stableSamples = 3;
const maxSampleGap = 600;

function drawHand(canvas, video, landmarks, connections) {
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;

  const points = landmarks.map(({ x, y }) => [x * canvas.width, y * canvas.height]);
  const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 320);
  context.lineWidth = 2 * scale;
  context.strokeStyle = '#fff2dc';
  context.fillStyle = '#f2bd82';
  context.shadowColor = '#3a2d31';
  context.shadowBlur = 3 * scale;

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

export function startHandPractice({ video, canvas, status, letter }) {
  let worker;
  let timer;
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

  function updateResult(landmarks, worldLandmarks) {
    const hand = landmarks.length === 1 ? landmarks[0] : null;
    drawHand(canvas, video, hand, connections);
    const prediction = hand ? classifySign(hand, worldLandmarks[0]) : null;
    const now = performance.now();
    samples = prediction && prediction === candidate && now - lastResultAt <= maxSampleGap ? samples + 1 : 1;
    candidate = prediction;
    lastResultAt = now;

    if (landmarks.length > 1) {
      show('Muestra una sola mano.');
    } else if (!hand) {
      show('Coloca una mano dentro del encuadre.');
    } else if (!prediction) {
      show('Mano detectada. No se pudo identificar la letra.');
    } else if (samples < stableSamples) {
      show('Mano detectada. Mantén la seña un momento.');
    } else if (prediction === letter) {
      show(`Letra ${prediction} detectada. Coincide con la referencia.`);
    } else {
      show(`Letra ${prediction} detectada. Practica la letra ${letter} de esta ficha.`);
    }
  }

  show('Cargando reconocimiento de A, B y C…');
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
        show('Coloca una mano dentro del encuadre.');
        requestFrame(0);
      } else if (data.type === 'result') {
        updateResult(data.landmarks, data.worldLandmarks);
        requestFrame(Math.max(0, frameInterval - (performance.now() - lastFrameAt)));
      } else {
        fail();
      }
    });
    worker.postMessage({ type: 'init' });
    timer = setTimeout(fail, 20000);
  } catch {
    fail();
  }
  return stop;
}
