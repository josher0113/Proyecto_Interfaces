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

const numerals = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  20, 30, 40, 50, 60, 70, 80, 90,
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
];

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
  assert.deepEqual(groups, [10, 9, 9]);
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".number-card strong"), card => +card.textContent)'), numerals);
  await noOverflow();

  for (const [step, number] of numerals.entries()) {
    await goTo('#leccion/1/' + step);
    await title('Número ' + number);
    await check(`Array.from(document.querySelectorAll('.number-poses img')).filter(image => image.naturalWidth).length === ${number <= 8 ? 1 : 2}`);
    assert.equal(await run(`Boolean(document.querySelector('a[href="#practica/1/${step}"]'))`), true);
  }
  await noOverflow();
  await run('document.querySelector(\'a[href="#practica/1/27"]\').click()');
  await check(`document.querySelector('#gesture-status[data-number="1000"][data-hand-count="2"]')`);
  assert.match(await run('document.querySelector(".page-heading").textContent'), /dos manos/);
  assert.equal(await run('document.querySelector("#gesture-attempt").disabled'), true);
  await noOverflow();
  assert.equal(requests.some(path => path.includes('mediapipe') || path.endsWith('.task')), false);

  await goTo('#practica/1/1');
  await title('Número 2');
  await run(cameraFixture);
  const gesture = 'document.querySelector("#gesture-status").textContent';
  const state = 'document.querySelector("#practice-letter-state").textContent';
  const record = 'document.querySelector("#practice-record")';
  const toggle = 'document.querySelector("#camera-toggle").click()';
  const pickSign = number => run('numberCamera.setSign(' + JSON.stringify(number) + ')');
  await pickSign(4);
  await run(toggle);
  await check(gesture + '.includes("Número 4 detectado. Practica el número 2")', 30000);
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run(state), '0/3 días');
  await pickSign(2);
  await check('!' + record + '.disabled', 20000);
  await run(record + '.click()');
  await check(state + ' === "1/3 días"');
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run(record + '.textContent'), 'Práctica de hoy registrada');

  for (const [day, expected] of [[21, '2/3 días'], [22, 'Aprendido']]) {
    await run(toggle);
    await run('setPracticeDay(' + day + ')');
    await run(toggle);
    await check('!' + record + '.disabled', 25000);
    await run(record + '.click()');
    await check(state + ' === ' + JSON.stringify(expected));
  }
  assert.equal(await run(record + '.disabled'), true);
  assert.equal(await run('numberCamera.requests'), 3);
  assert.deepEqual(await run('Object.keys(localStorage).filter(key => key.startsWith("linguaplay:number")).sort()'), [
    'linguaplay:number-practice:v1:2:2026-11-19',
    'linguaplay:number-practice:v1:2:2026-11-21',
    'linguaplay:number-practice:v1:2:2026-11-22',
  ]);
  await run('window.lastCameraTrack = document.querySelector("#camera-video").srcObject.getVideoTracks()[0]');
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

  await goTo('#practica/1/27');
  await title('Número 1000');
  await run(cameraFixture);
  await pickSign('1000-1');
  await run(toggle);
  await check(gesture + '.includes("Manos detectadas")', 25000);
  await run('document.querySelector("#gesture-attempt").click()');
  await check('document.querySelector("#gesture-attempt").textContent === "Evaluando…"');
  await check('document.querySelector("#gesture-attempt").textContent === "Evaluar otro intento"');
  assert.equal(await run(record + '.disabled'), true);
  assert.deepEqual(errors, []);
}

runBrowserTest(numbersScenario, ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']).then(() => {
  console.log('Edge: 28 fichas, diseño a 320 px, práctica del 2 en tres fechas, rechazo de un 1000 inmóvil y progreso tras recargar.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
