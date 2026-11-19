const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

function configureRecognition() {
  const api = new URLSearchParams(location.search).get('api');
  const sessions = [];
  let startError = null;
  class FakeRecognition extends EventTarget {
    constructor() {
      super();
      sessions.push(this);
      this.started = 0;
      this.stopped = 0;
      this.aborted = 0;
    }

    start() {
      this.started++;
      if (startError) {
        const name = startError;
        startError = null;
        throw new DOMException('Fallo simulado al iniciar', name);
      }
    }

    stop() { this.stopped++; }
    abort() { this.aborted++; }

    emit(type, properties = {}) {
      this.dispatchEvent(Object.assign(new Event(type), properties));
    }

    result(resultIndex, entries) {
      const results = entries.map(([transcript, isFinal = true]) => Object.assign([{ transcript }], { isFinal }));
      this.emit('result', { resultIndex, results });
    }
  }

  Object.defineProperty(window, 'SpeechRecognition', { value: api === 'standard' ? FakeRecognition : undefined });
  Object.defineProperty(window, 'webkitSpeechRecognition', { value: api === 'webkit' ? FakeRecognition : undefined });
  window.speechFixture = { sessions, failNextStart: name => { startError = name; } };
}

async function integration({ send, run, check, navigate, errors }) {
  const field = 'document.querySelector("#phrase")';
  const toggle = 'document.querySelector("#dictation-toggle")';
  const label = 'document.querySelector("#dictation-label").textContent.trim()';
  const status = 'document.querySelector("#dictation-status").textContent';
  const consultation = 'document.querySelector("#traductor .feedback, main .feedback").textContent';
  const session = 'speechFixture.sessions.at(-1)';
  const click = () => run(toggle + '.click()');
  const type = value => run(field + '.value = ' + JSON.stringify(value));
  const expectLabel = value => check(label + ' === ' + JSON.stringify(value));
  const runText = () => run(field + '.value');
  const speak = (startingAt, entries) => run(session + '.result(' + startingAt + ', ' + JSON.stringify(entries) + ')');
  const emit = (event, details = {}) => run(session + '.emit(' + JSON.stringify(event) + ', ' + JSON.stringify(details) + ')');
  const open = async api => {
    await navigate('?api=' + api + '#traductor');
    await check('!!' + toggle);
  };

  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: '(' + configureRecognition.toString() + ')();' });
  await open('standard');
  await expectLabel('Dictar en español');
  assert.equal(await run('speechFixture.sessions.length'), 0);
  assert.match(await run('document.querySelector("#dictation-note").textContent'), /navegador|servicio/i);
  await type('Hola');
  await click();
  await expectLabel('Cancelar dictado');
  const config = await run('(({ lang, continuous, interimResults, maxAlternatives, started }) => ({ lang, continuous, interimResults, maxAlternatives, started }))(' + session + ')');
  assert.deepEqual(config, { lang: 'es-MX', continuous: false, interimResults: false, maxAlternatives: 1, started: 1 });
  await emit('start');
  await expectLabel('Detener dictado');
  await speak(0, [['luego', false]]);
  assert.equal(await runText(), 'Hola');
  await speak(0, [[' mundo ']]);
  await speak(1, [['mundo'], ['qué tal']]);
  assert.equal(await runText(), 'Hola');
  const initialConsultation = await run(consultation);
  await click();
  await expectLabel('Procesando…');
  assert.equal(await run(session + '.stopped'), 1);
  assert.equal(await run(session + '.aborted'), 0);
  await emit('end');
  await expectLabel('Dictar en español');
  assert.equal(await runText(), 'Hola mundo qué tal');
  assert.match(await run(status), /añadid/i);
  assert.equal(await run(consultation), initialConsultation);

  await run(field + '.focus(); ' + field + '.setSelectionRange(0, ' + field + '.value.length)');
  await send('Input.insertText', { text: 'Buenos días' });
  assert.equal(await runText(), 'Buenos días');
  await run('document.querySelector("#translate").requestSubmit()');
  assert.match(await run(consultation), /Buenos días/);

  for (const [error, description] of [
    ['not-allowed', /permiso/i], ['network', /conexión/i], ['no-speech', /voz/i],
  ]) {
    await click();
    await emit('error', { error });
    await emit('end');
    await expectLabel('Dictar en español');
    assert.match(await run(status), description);
    assert.equal(await runText(), 'Buenos días');
  }

  await run('speechFixture.failNextStart("NotAllowedError")');
  await click();
  await expectLabel('Dictar en español');
  assert.match(await run(status), /permiso/i);
  assert.equal(await runText(), 'Buenos días');

  await click();
  await expectLabel('Cancelar dictado');
  await click();
  assert.equal(await run(session + '.aborted'), 1);
  await speak(0, [['frase cancelada']]);
  await emit('end');
  await expectLabel('Dictar en español');
  assert.equal(await runText(), 'Buenos días');

  await click();
  await emit('start');
  await run('window.oldSpeech = ' + session + '; location.hash = "#inicio"');
  await check('!' + toggle + ' && oldSpeech.aborted === 1');
  await run('location.hash = "#traductor"');
  await check('!!' + toggle);
  await type('Borrador nuevo');
  await click();
  await emit('start');
  await run('oldSpeech.result(0, [["resultado tardío"]]); oldSpeech.emit("end")');
  await expectLabel('Detener dictado');
  assert.equal(await runText(), 'Borrador nuevo');
  await speak(0, [['actual']]);
  await emit('end');
  assert.equal(await runText(), 'Borrador nuevo actual');

  const longDraft = 'a'.repeat(298);
  await type(longDraft);
  await click();
  await emit('start');
  await speak(0, [['mucho texto']]);
  await emit('end');
  assert.ok((await runText()).startsWith(longDraft));
  assert.ok((await runText()).length <= 300);

  await click();
  await emit('start');
  await run('window.dispatchEvent(new PageTransitionEvent("pagehide"))');
  assert.equal(await run(session + '.aborted'), 1);
  const beforeLateResult = await runText();
  await speak(0, [['resultado tardío']]);
  await emit('end');
  assert.equal(await runText(), beforeLateResult);

  await open('webkit');
  await expectLabel('Dictar en español');
  await click();
  assert.equal(await run(session + '.lang'), 'es-MX');
  await emit('start');
  await speak(0, [['Hola']]);
  await emit('end');
  assert.equal(await runText(), 'Hola');

  await open('unavailable');
  assert.equal(await run(toggle + '.disabled'), true);
  await run(field + '.focus()');
  await send('Input.insertText', { text: 'Puedo escribir' });
  await run('document.querySelector("#translate").requestSubmit()');
  assert.match(await run(consultation), /Puedo escribir/);
  assert.deepEqual(errors, []);
  console.log('Edge con dictado simulado: es-MX, revisión y envío manual, límite de texto, errores, cancelación, navegación y escritura sin micrófono.');
}

runBrowserTest(integration).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
