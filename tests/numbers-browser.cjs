const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

const cameraFixture = `(() => {
  const NativeDate = Date;
  let day = 19;
  window.setPracticeDay = date => { day = date; };
  window.Date = class extends NativeDate {
    constructor(...parts) {
      super(...(parts.length ? parts : [2026, 10, day, 12]));
    }
    static now() {
      return new Date().getTime();
    }
  };

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext('2d');
  const camera = { image: null, requests: 0 };
  window.numberCamera = camera;
  camera.setSign = async number => {
    const image = new Image();
    image.src = '/assets/numeros/' + number + '.jpg';
    await image.decode();
    camera.image = image;
  };
  setInterval(() => {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (camera.image) {
      const scale = Math.min(canvas.width / camera.image.width, canvas.height / camera.image.height);
      const width = camera.image.width * scale;
      const height = camera.image.height * scale;
      context.drawImage(camera.image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    }
  }, 40);
  navigator.mediaDevices.getUserMedia = ({ video, audio }) => {
    if (!video || audio) throw Error('La práctica requiere solo video.');
    camera.requests++;
    return Promise.resolve(canvas.captureStream(24));
  };
})()`;

const numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function numbersScenario({ send, run, check, navigate, errors, requests }) {
  const goTo = hash => run('location.hash = ' + JSON.stringify(hash));
  const title = name => check('document.querySelector("h1").textContent === ' + JSON.stringify(name));
  const noOverflow = async () => {
    const widths = await run('({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth })');
    assert.ok(widths.content <= widths.viewport, `Desbordamiento horizontal: ${JSON.stringify(widths)}`);
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#aprender');
  await title('Ruta de aprendizaje');
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".unit h2"), heading => heading.textContent)'), [
    'Abecedario', 'Números', 'Saludos básicos', 'Expresiones cotidianas', 'Frases y comunicación básica',
  ]);
  await run('document.querySelector(\'a[href="#numeros"]\').click()');
  await title('Números');
  const groups = await run('Array.from(document.querySelectorAll(".number-index"), list => list.childElementCount)');
  assert.deepEqual(groups, [10]);
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".number-card strong"), card => +card.textContent)'), numerals);
  await noOverflow();

  for (const [step, number] of numerals.entries()) {
    await goTo('#leccion/1/' + step);
    await title('Número ' + number);
    await check(`Array.from(document.querySelectorAll('.number-poses img')).filter(image => image.naturalWidth).length === ${number <= 8 ? 1 : 2}`);
    assert.equal(await run(`Boolean(document.querySelector('a[href="#practica/1/${step}"]'))`), true);
  }
  await noOverflow();
  for (const removed of ['#leccion/1/10', '#practica/1/27']) {
    await goTo(removed);
    await title('Números');
    assert.equal(await run('document.querySelector(".number-index").childElementCount'), 10);
  }
  assert.equal(requests.some(path => path.includes('mediapipe') || path.endsWith('.task')), false);

  await goTo('#practica/1/1');
  await title('Número 2');
  assert.equal(await run('Boolean(document.querySelector(\'#gesture-status[data-number="2"]:not([data-letter])\'))'), true);
  await run(cameraFixture);
  const gesture = 'document.querySelector("#gesture-status").textContent';
  const state = 'document.querySelector("#practice-letter-state").textContent';
  const record = 'document.querySelector("#practice-record")';
  const toggle = 'document.querySelector("#camera-toggle").click()';
  const pickSign = number => run('numberCamera.setSign(' + JSON.stringify(number) + ')');
  await pickSign(4);
  await run(toggle);
  await check(gesture + '.includes("La seña no coincide con el número 2")', 30000);
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run(state), '0/3 días');
  await pickSign(2);
  await check(gesture + '.includes("Número 2 detectado. Coincide con la referencia.")');
  assert.equal(requests.some(path => /(?:^|\/)sign-(?:classifier|motion)\.mjs$/.test(path)), false);
  await check('!' + record + '.disabled', 20000);
  await run(record + '.click()');
  await check(state + ' === "1/3 días"');
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run(record + '.textContent'), 'Práctica de hoy registrada');

  const currentTrack = 'document.querySelector("#camera-video").srcObject.getVideoTracks()[0]';
  await run('window.numberTrack = ' + currentTrack);
  await goTo('#practica/0/22');
  await title('Letra V');
  assert.equal(await run('numberTrack.readyState'), 'ended');
  await run(toggle);
  await check(gesture + '.includes("Letra V detectada. Coincide con la referencia.")', 30000);

  await run('window.letterTrack = ' + currentTrack);
  await goTo('#practica/1/1');
  await title('Número 2');
  assert.equal(await run('letterTrack.readyState'), 'ended');
  assert.equal(await run('Boolean(document.querySelector(\'#gesture-status[data-number="2"]:not([data-letter])\'))'), true);
  for (const [day, expected] of [[21, '2/3 días'], [22, 'Aprendido']]) {
    await run('setPracticeDay(' + day + ')');
    await run(toggle);
    await check(gesture + '.includes("Número 2 detectado. Coincide con la referencia.")', 25000);
    await run(record + '.click()');
    await check(state + ' === ' + JSON.stringify(expected));
    if (day === 21) await run(toggle);
  }
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run('numberCamera.requests'), 4);
  assert.deepEqual(await run('Object.keys(localStorage).filter(key => key.startsWith("linguaplay:number")).sort()'), [
    'linguaplay:number-practice:v1:2:2026-11-19',
    'linguaplay:number-practice:v1:2:2026-11-21',
    'linguaplay:number-practice:v1:2:2026-11-22',
  ]);
  await run('window.lastCameraTrack = ' + currentTrack);
  await goTo('#progreso');
  await title('Progreso');
  assert.equal(await run('lastCameraTrack.readyState'), 'ended');
  const learned = 'document.querySelector(\'a.number-card.letter-mastered[href="#practica/1/1"]\')';
  assert.match(await run(learned + '.textContent'), /Aprendido/);
  assert.equal(await run('document.querySelectorAll(".alphabet-letter.letter-mastered").length'), 0);
  assert.equal(await run('/Frutas|Colores/.test(document.querySelector("main").textContent)'), false);
  await noOverflow();
  const origin = await run('performance.timeOrigin');
  await send('Page.reload');
  await check('performance.timeOrigin !== ' + origin + ' && !!' + learned);

  await run(cameraFixture);
  for (const number of [9, 10]) {
    await goTo('#practica/1/' + (number - 1));
    await title('Número ' + number);
    await pickSign(number + '-1');
    await run(toggle);
    await check(gesture + '.includes("Mano detectada")', 25000);
    await run('document.querySelector("#gesture-attempt").click()');
    await check('document.querySelector("#gesture-attempt").textContent === "Evaluando…"');
    await check('document.querySelector("#gesture-attempt").textContent === "Evaluar otro intento"');
    assert.equal(await run(record + '.disabled'), true);
    assert.match(await run(gesture), /No se pudo identificar el movimiento/);
  }
  assert.equal(await run(`(async () => {
    const { startHandPractice, startNumberPractice } = await import('./hand-practice.mjs');
    try { startHandPractice({ letter: '2', kind: 'number' }); } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      try { startNumberPractice({ number: '20' }); } catch (numberError) {
        return numberError instanceof RangeError;
      }
    }
    return false;
  })()`), true);
  assert.deepEqual(errors, []);
}

runBrowserTest(numbersScenario, ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']).then(() => {
  console.log('Edge: 10 fichas, cambio de práctica entre 2 y V, tres fechas de progreso y rechazo de 9 y 10 inmóviles.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
