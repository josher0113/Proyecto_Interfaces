function createDictation() {
  const defaultLabel = 'Dictar en español';
  const errors = {
    'not-allowed': 'No se concedió el permiso del micrófono. Revisa los permisos del sitio e inténtalo de nuevo.',
    'service-not-allowed': 'El navegador bloqueó el servicio de voz. Revisa la configuración o escribe la frase.',
    'audio-capture': 'El navegador no pudo usar el micrófono. Revisa si está conectado o escribe la frase.',
    'no-speech': 'No se detectó voz. Inténtalo de nuevo o escribe la frase.',
    network: 'No hubo conexión con el servicio de voz. Inténtalo de nuevo o escribe la frase.',
    'language-not-supported': 'El servicio de voz no ofrece español de México en este navegador. Puedes escribir la frase.',
    'language-unavailable': 'El español de México no está disponible en el servicio de voz. Puedes escribir la frase.',
  };
  const startError = 'No se pudo iniciar el dictado. Revisa el micrófono o escribe la frase.';
  let current = null;

  function recognitionConstructor() {
    if (!window.isSecureContext || location.protocol === 'file:') return null;
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    return typeof Recognition === 'function' ? Recognition : null;
  }

  function finish(session, message) {
    if (current !== session) return false;
    current = null;
    clearTimeout(session.timeout);
    session.button.disabled = false;
    session.label.textContent = defaultLabel;
    session.status.textContent = message;
    return true;
  }

  function cancel(message = '') {
    const session = current;
    if (!session || !finish(session, message)) return;
    try {
      session.recognition.abort();
    } catch {
      // A service that already disconnected can reject cancellation.
    }
  }

  function appendTranscript(session) {
    const { field, results } = session;
    const transcript = results.join(' ').trim();
    if (!transcript) return 'No se detectó voz. Inténtalo de nuevo o escribe la frase.';
    const separator = !field.value || /\s$/.test(field.value) ? '' : ' ';
    const available = Math.max(0, field.maxLength - field.value.length - separator.length);
    const addition = transcript.slice(0, available).replace(/[\uD800-\uDBFF]$/, '').trimEnd();
    if (!addition) return `Quedó poco espacio en el campo. El límite es de ${field.maxLength} caracteres.`;
    field.value += separator + addition;
    return addition.length < transcript.length
      ? `Texto añadido hasta el límite de ${field.maxLength} caracteres. Puedes editarlo antes de consultar.`
      : 'Texto añadido. Puedes editarlo antes de consultar.';
  }

  function stop() {
    const session = current;
    if (!session.started) {
      cancel('Dictado cancelado.');
      return;
    }
    session.button.disabled = true;
    session.label.textContent = 'Procesando…';
    session.status.textContent = 'Procesando el dictado…';
    try {
      session.recognition.stop();
    } catch {
      cancel('Se interrumpió el dictado. Puedes intentarlo de nuevo o escribir la frase.');
    }
  }

  function toggle(form) {
    if (current) {
      stop();
      return;
    }
    const Recognition = recognitionConstructor();
    if (!Recognition) return;
    const status = form.querySelector('#dictation-status');

    let recognition;
    try {
      recognition = new Recognition();
    } catch {
      status.textContent = startError;
      return;
    }
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    const session = {
      recognition,
      field: form.querySelector('#phrase'),
      button: form.querySelector('#dictation-toggle'),
      label: form.querySelector('#dictation-label'),
      status,
      started: false,
      results: [],
    };
    current = session;

    recognition.addEventListener('start', () => {
      if (current !== session) return;
      session.started = true;
      session.label.textContent = 'Detener dictado';
      status.textContent = 'Escuchando. Di una frase corta en español.';
    });
    recognition.addEventListener('result', event => {
      if (current !== session) return;
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        if (result.isFinal) session.results[index] = result[0]?.transcript.trim() ?? '';
      }
    });
    recognition.addEventListener('error', event => {
      const message = Object.hasOwn(errors, event.error) ? errors[event.error] : 'Se interrumpió el dictado. Puedes intentarlo de nuevo o escribir la frase.';
      finish(session, message);
    });
    recognition.addEventListener('end', () => {
      if (current === session) finish(session, appendTranscript(session));
    });

    session.label.textContent = 'Cancelar dictado';
    status.textContent = 'Esperando el micrófono…';
    session.timeout = setTimeout(() => {
      cancel('Terminó el tiempo de dictado. Intenta con una frase corta o usa el campo de texto.');
    }, 45000);
    try {
      recognition.start();
    } catch (error) {
      const permissionDenied = error.name === 'NotAllowedError' || error.name === 'SecurityError';
      finish(session, permissionDenied ? errors['not-allowed'] : startError);
    }
  }

  return { available: () => Boolean(recognitionConstructor()), toggle, cancel };
}
