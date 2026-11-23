const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runBrowserTest } = require('./browser-harness.cjs');

function configureMicrophone(waveData) {
  const microphone = {
    calls: 0,
    remoteCalls: 0,
    error: null,
    defer: false,
    track: null,
    streams: 0,
    ended: false,
    async open() {
      this.calls++;
      if (this.error) throw new DOMException('Error simulado', this.error);
      if (this.defer) await new Promise(resolve => { this.release = resolve; });

      const context = new AudioContext({ sampleRate: 16000 });
      const destination = context.createMediaStreamDestination();
      const source = context.createBufferSource();
      source.buffer = waveData
        ? await context.decodeAudioData(Uint8Array.from(atob(waveData), value => value.charCodeAt(0)).buffer)
        : context.createBuffer(1, 8000, context.sampleRate);
      source.connect(destination);
      this.ended = false;
      source.onended = () => { this.ended = true; };
      await context.resume();
      this.track = destination.stream.getAudioTracks()[0];
      this.streams++;
      const stopTrack = this.track.stop.bind(this.track);
      this.track.stop = () => {
        stopTrack();
        void context.close();
      };
      this.play = () => source.start();
      return destination.stream;
    },
  };

  class ForbiddenBrowserSpeech {
    constructor() {
      microphone.remoteCalls++;
      throw Error('Se intentó abrir el servicio remoto');
    }
  }
  Object.defineProperty(window, 'SpeechRecognition', { value: ForbiddenBrowserSpeech });
  Object.defineProperty(window, 'webkitSpeechRecognition', { value: ForbiddenBrowserSpeech });
  const unsupported = new URLSearchParams(location.search).get('mic') === 'unsupported';
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
    value: unsupported ? undefined : microphone.open.bind(microphone),
  });
  window.dictationFixture = microphone;
}

// Optional WAV with the phrase "Buenos días, esto es una prueba de dictado".
const wavePath = process.argv[2];
const waveData = wavePath ? readFileSync(wavePath).toString('base64') : null;

async function integration({ send, run, check, navigate, errors, requests, blockRequests }) {
  const field = 'document.querySelector("#phrase")';
  const toggle = 'document.querySelector("#dictation-toggle")';
  const label = 'document.querySelector("#dictation-label").textContent.trim()';
  const status = 'document.querySelector("#dictation-status").textContent';
  const consultation = 'main .feedback';
  const click = () => run(toggle + '.click()');
  const type = value => run(field + '.value = ' + JSON.stringify(value));
  const readText = () => run(field + '.value');
  const expectLabel = value => check(label + ' === ' + JSON.stringify(value), 90000);
  const open = async (query = '') => {
    await navigate(query + '#traductor');
    await check('!!' + toggle);
  };

  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: '(' + configureMicrophone.toString() + ')(' + JSON.stringify(waveData) + ');',
  });
  await open();
  assert.equal(await run('dictationFixture.calls'), 0);
  assert.equal(requests.some(path => path.startsWith('vendor/vosk/')), false);
  assert.match(await run('document.querySelector("#dictation-note").textContent'), /local|dispositivo/i);

  await type('Prueba inicial');
  const initialConsultation = await run('document.querySelector(' + JSON.stringify(consultation) + ').textContent');
  await click();
  await expectLabel('Detener dictado');
  assert.ok(requests.includes('vendor/vosk/model-es.tar.gz'));
  await run('dictationFixture.play()');
  await check('dictationFixture.ended');
  await click();
  await expectLabel('Dictar en español');
  assert.equal(await run('dictationFixture.track.readyState'), 'ended');
  assert.equal(await run('dictationFixture.remoteCalls'), 0);
  assert.equal(await run('document.querySelector(' + JSON.stringify(consultation) + ').textContent'), initialConsultation);
  if (waveData) {
    assert.match(await readText(), /^Prueba inicial /);
    assert.match(await readText(), /buenos d[ií]as.*prueba de dictado/i);
  } else {
    assert.equal(await readText(), 'Prueba inicial');
    assert.match(await run(status), /voz|audio|frase/i);
  }

  await run(field + '.focus(); ' + field + '.setSelectionRange(0, ' + field + '.value.length)');
  await send('Input.insertText', { text: 'Buenos días' });
  assert.equal(await readText(), 'Buenos días');
  await run('document.querySelector("#translate").requestSubmit()');
  assert.match(await run('document.querySelector(' + JSON.stringify(consultation) + ').textContent'), /Buenos días/);

  await run('dictationFixture.error = "NotAllowedError"');
  await click();
  await check('/permiso/i.test(' + status + ')');
  await expectLabel('Dictar en español');
  assert.equal(await readText(), 'Buenos días');
  await run('dictationFixture.error = "NotFoundError"');
  await click();
  await check('/micrófono/i.test(' + status + ')');
  await expectLabel('Dictar en español');
  assert.equal(await readText(), 'Buenos días');

  await run('dictationFixture.error = null; dictationFixture.defer = true');
  const previousStreams = await run('dictationFixture.streams');
  await click();
  await expectLabel('Cancelar dictado');
  await check('!!dictationFixture.release');
  await click();
  await expectLabel('Dictar en español');
  await run('dictationFixture.release(); dictationFixture.defer = false');
  await check('dictationFixture.streams > ' + previousStreams + ' && dictationFixture.track.readyState === "ended"');
  assert.equal(await readText(), 'Buenos días');

  await click();
  await expectLabel('Detener dictado');
  await run('window.oldTrack = dictationFixture.track; location.hash = "#inicio"');
  await check('!' + toggle + ' && oldTrack.readyState === "ended"');
  await run('location.hash = "#traductor"');
  await check('!!' + toggle);
  await click();
  await expectLabel('Detener dictado');
  await run('window.dispatchEvent(new PageTransitionEvent("pagehide"))');
  await check('dictationFixture.track?.readyState === "ended"');
  await expectLabel('Dictar en español');

  await open('?mic=unsupported');
  assert.equal(await run(toggle + '.disabled'), true);
  await run(field + '.focus()');
  await send('Input.insertText', { text: 'Puedo escribir' });
  await run('document.querySelector("#translate").requestSubmit()');
  assert.match(await run('document.querySelector(' + JSON.stringify(consultation) + ').textContent'), /Puedo escribir/);
  assert.equal(await run('dictationFixture.remoteCalls'), 0);

  blockRequests(/\/vosk\.js$/);
  await open('?model=missing');
  await type('Mi borrador');
  await click();
  await check('/no se pudo/i.test(' + status + ')', 90000);
  assert.equal(await readText(), 'Mi borrador');
  await expectLabel('Dictar en español');
  assert.equal(await run('dictationFixture.remoteCalls'), 0);
  assert.deepEqual(errors, []);
  console.log('Edge con Vosk local: captura, cancelación, cierre, permisos, motor indisponible y escritura manual verificados.' +
    (waveData ? ' El WAV en español se transcribió correctamente.' : ' El silencio conservó el borrador.'));
}

runBrowserTest(integration, ['--autoplay-policy=no-user-gesture-required']).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
