function createDictation() {
  const defaultLabel = 'Dictar en español';
  const missingPermission = 'No se concedió el permiso del micrófono. Revisa los permisos del sitio o escribe la frase.';
  const audioErrors = {
    NotAllowedError: missingPermission,
    SecurityError: missingPermission,
    NotFoundError: 'No se encontró un micrófono. Revisa si hay uno conectado o escribe la frase.',
    NotReadableError: 'No se pudo usar el micrófono. Revisa si otra aplicación lo está usando.',
  };
  const captureError = 'No se pudo terminar el dictado. Puedes intentarlo de nuevo o escribir la frase.';
  let current = null;

  function available() {
    return window.isSecureContext && location.protocol !== 'file:'
      && typeof navigator.mediaDevices?.getUserMedia === 'function'
      && typeof AudioContext === 'function'
      && typeof AudioWorkletNode === 'function'
      && typeof Worker === 'function'
      && typeof WebAssembly === 'object';
  }

  function releaseMicrophone(session) {
    session.stream?.getTracks().forEach(track => track.stop());
    session.stream = null;
  }

  function finish(session, message) {
    if (current !== session) return;
    current = null;
    clearTimeout(session.timeout);
    session.controller.abort();
    releaseMicrophone(session);
    if (session.context && session.context.state !== 'closed') {
      void session.context.close().catch(() => {});
    }
    session.button.disabled = false;
    session.label.textContent = defaultLabel;
    session.status.textContent = message;
  }

  function cancel(message = '') {
    if (current) finish(current, message);
  }

  function appendTranscript(field, transcript) {
    const text = transcript.trim();
    if (!text) return 'No se detectó voz. Inténtalo de nuevo o escribe la frase.';
    const separator = !field.value || /\s$/.test(field.value) ? '' : ' ';
    const available = Math.max(0, field.maxLength - field.value.length - separator.length);
    const addition = text.slice(0, available).replace(/[\uD800-\uDBFF]$/, '').trimEnd();
    if (!addition) return 'El campo ya está lleno. Puedes editar el texto para hacer espacio.';
    field.value += separator + addition;
    return addition.length < text.length
      ? 'Texto añadido hasta el límite de 300 caracteres. Puedes editarlo antes de consultar.'
      : 'Texto añadido. Puedes editarlo antes de consultar.';
  }

  function stop(session) {
    if (!session.capture) {
      finish(session, 'Dictado cancelado.');
      return;
    }
    clearTimeout(session.timeout);
    session.button.disabled = true;
    session.label.textContent = 'Procesando…';
    session.status.textContent = 'Procesando el dictado en este dispositivo…';
    try {
      session.capture.stop();
      releaseMicrophone(session);
      session.timeout = setTimeout(() => finish(session, captureError), 8000);
    } catch {
      finish(session, captureError);
    }
  }

  async function prepare(session) {
    try {
      session.context = new AudioContext();
      const streamRequest = navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      }).then(stream => {
        if (current === session) {
          session.stream = stream;
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
        return stream;
      });
      await Promise.all([streamRequest, session.context.resume()]);
      if (current !== session) return;
    } catch (error) {
      finish(session, Object.hasOwn(audioErrors, error.name) ? audioErrors[error.name] : 'No se pudo iniciar el micrófono. Puedes escribir la frase.');
      return;
    }

    for (const track of session.stream.getAudioTracks()) {
      track.addEventListener('ended', () => finish(session, 'El micrófono se desconectó. Puedes escribir la frase.'), { once: true });
    }
    session.status.textContent = 'Cargando el reconocimiento local de español…';
    try {
      const { connectLocalSpeech } = await import('./local-speech.mjs');
      if (current !== session) return;
      const capture = await connectLocalSpeech(session.context, session.stream, {
        signal: session.controller.signal,
        onResult: transcript => {
          if (current === session) finish(session, appendTranscript(session.field, transcript));
        },
        onError: () => finish(session, captureError),
      });
      if (current !== session) return;
      session.capture = capture;
    } catch {
      finish(session, 'No se pudo cargar el reconocimiento local. Recarga Conecta LSM o escribe la frase.');
      return;
    }

    clearTimeout(session.timeout);
    session.label.textContent = 'Detener dictado';
    session.status.textContent = 'Escuchando. Di una frase corta y pulsa Detener dictado.';
    session.timeout = setTimeout(() => stop(session), 20000);
  }

  function toggle(form) {
    if (current) {
      stop(current);
      return;
    }
    if (!available()) return;
    const session = {
      controller: new AbortController(),
      field: form.querySelector('#phrase'),
      button: form.querySelector('#dictation-toggle'),
      label: form.querySelector('#dictation-label'),
      status: form.querySelector('#dictation-status'),
      capture: null,
    };
    current = session;
    session.label.textContent = 'Cancelar dictado';
    session.status.textContent = 'Esperando el micrófono…';
    session.timeout = setTimeout(() => {
      finish(session, 'Terminó la espera del micrófono o del modelo local. Intenta otra vez o escribe la frase.');
    }, 60000);
    void prepare(session);
  }

  return { available, toggle, cancel };
}
