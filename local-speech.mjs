let cachedModel;

async function loadModel() {
  await import('./vendor/vosk/vosk.js');
  const model = new globalThis.Vosk.Model(new URL('./vendor/vosk/model-es.tar.gz', import.meta.url).href, -2);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => fail(), 45000);
    function fail() {
      clearTimeout(timeout);
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', fail);
      model.terminate();
      reject(new Error('No se pudo cargar el modelo de español.'));
    }
    function onLoad({ detail }) {
      if (!detail.result) {
        fail();
        return;
      }
      clearTimeout(timeout);
      model.removeEventListener('error', fail);
      resolve(model);
    }
    model.addEventListener('load', onLoad, { once: true });
    model.addEventListener('error', fail, { once: true });
  });
}

function getModel() {
  cachedModel ??= loadModel().catch(error => {
    cachedModel = undefined;
    throw error;
  });
  return cachedModel;
}

export async function connectLocalSpeech(context, stream, { signal, onResult, onError }) {
  const [model] = await Promise.all([
    getModel(),
    context.audioWorklet.addModule(new URL('./voice-capture-processor.js', import.meta.url)),
  ]);
  if (signal.aborted) return null;

  const capture = new AudioWorkletNode(context, 'linguaplay-voice-capture', {
    channelCount: 1,
    channelCountMode: 'explicit',
    outputChannelCount: [1],
  });
  const microphone = context.createMediaStreamSource(stream);
  const recognizer = new model.KaldiRecognizer(context.sampleRate);
  const recognized = [];
  let buffersPending = 0;
  let flushed = false;
  let finalRequested = false;

  function cleanup() {
    model.removeEventListener('error', onError);
    microphone.disconnect();
    capture.disconnect();
    capture.port.close();
    recognizer.remove();
  }
  signal.addEventListener('abort', cleanup, { once: true });
  model.addEventListener('error', onError);
  capture.addEventListener('processorerror', onError);

  function finishWhenReady() {
    if (flushed && buffersPending === 0 && !finalRequested) {
      finalRequested = true;
      recognizer.retrieveFinalResult();
    }
  }

  recognizer.on('result', ({ result }) => {
    if (signal.aborted) return;
    if (result.text?.trim()) recognized.push(result.text.trim());
    if (finalRequested) {
      onResult(recognized.join(' '));
    } else {
      buffersPending--;
      finishWhenReady();
    }
  });
  recognizer.on('partialresult', () => {
    if (signal.aborted || finalRequested) return;
    buffersPending--;
    finishWhenReady();
  });
  capture.port.onmessage = ({ data }) => {
    if (signal.aborted) return;
    try {
      if (data.type === 'samples') {
        buffersPending++;
        recognizer.acceptWaveformFloat(data.samples, context.sampleRate);
      } else if (data.type === 'flushed') {
        flushed = true;
        finishWhenReady();
      }
    } catch {
      onError();
    }
  };
  microphone.connect(capture).connect(context.destination);

  return { stop: () => capture.port.postMessage({ type: 'flush' }) };
}
