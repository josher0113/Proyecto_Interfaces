const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

function createCameraFixture() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext('2d');
  const video = document.createElement('video');
  video.muted = true;
  navigator.mediaDevices.getUserMedia = () => Promise.resolve(canvas.captureStream(24));
  setInterval(() => {
    context.fillStyle = '#ddd';
    context.fillRect(0, 0, 640, 480);
    if (video.readyState >= 2) {
      const scale = Math.min(640 / video.videoWidth, 480 / video.videoHeight);
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      context.drawImage(video, (640 - width) / 2, (480 - height) / 2, width, height);
    }
  }, 34);
  let previousUrl;
  window.loadVocabularyClip = async (file, start) => {
    video.pause();
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    const response = await fetch('/assets/vocabulario/' + file + '.mp4');
    previousUrl = URL.createObjectURL(await response.blob());
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = reject;
      video.src = previousUrl;
    });
    await new Promise(resolve => {
      video.onseeked = resolve;
      video.currentTime = start;
    });
    video.playbackRate = .9;
  };
  window.playVocabularyClip = () => video.play();
}

runBrowserTest(async ({ send, run, check, navigate, errors }) => {
  await navigate('#aprender');
  await check('document.querySelectorAll(".vocabulary-unit a").length === 2');
  assert.deepEqual(await run('[...document.querySelectorAll(".vocabulary-unit a")].map(a => a.hash)'), ['#frutas', '#colores']);
  await run('(' + createCameraFixture.toString() + ')()');
  const terms = [['frutas', 'manzana', 2.55], ['frutas', 'platano', 2.60], ['frutas', 'pera', 1.90],
    ['colores', 'rojo', .95], ['colores', 'amarillo', .70], ['colores', 'verde', .90]];
  const attempt = 'document.querySelector("#gesture-attempt")';
  const record = 'document.querySelector("#practice-record")';
  const status = 'document.querySelector("#gesture-status")';
  const clickCamera = () => run('document.querySelector("#camera-toggle").click()');
  const navigateTo = async hash => {
    await run('location.hash = ' + JSON.stringify(hash));
    await check('location.hash === ' + JSON.stringify('#' + hash) + ' && !!document.querySelector("main h1")');
  };
  async function evaluate() {
    await run(attempt + '.click()');
    await check(attempt + '.textContent === "Evaluando…"');
    await run('playVocabularyClip()');
    await check('!' + attempt + '.disabled', 10000);
    return run(status + '.textContent');
  }

  await navigateTo('frutas');
  await check('document.querySelector("h1").textContent === "Frutas"');
  assert.equal(await run('document.querySelectorAll(".vocabulary-index li").length'), 3);
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
  await check('innerWidth === 320');
  assert.equal(await run('document.documentElement.scrollWidth'), 320);
  await send('Emulation.clearDeviceMetricsOverride');

  await run(`(() => {
    for (const offset of [1, 2]) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0')).join('-');
      localStorage.setItem('linguaplay:vocabulary-practice:v1:manzana:' + day, '1');
    }
  })()`);
  await navigateTo('practica-vocabulario/frutas/manzana');
  await check(status + '?.dataset.letter === "manzana"');
  await run('loadVocabularyClip("rojo", .95)');
  await clickCamera();
  await check('!' + attempt + '.disabled', 25000);
  assert.match(await evaluate(), /otra seña|No se pudo identificar/);
  assert.equal(await run(record + '.disabled'), true);
  await clickCamera();

  for (const [unit, id, start] of terms) {
    await navigateTo('practica-vocabulario/' + unit + '/' + id);
    await check(status + '?.dataset.letter === ' + JSON.stringify(id));
    assert.match(await run('document.querySelector(".alphabet-video").getAttribute("src")'), new RegExp(id + '\\.mp4'));
    await run('loadVocabularyClip(' + JSON.stringify(id) + ', ' + start + ')');
    await clickCamera();
    await check('!' + attempt + '.disabled', 25000);
    assert.equal(await run(record + '.disabled'), true);
    const result = await evaluate();
    assert.equal(result, 'La seña coincide con la muestra.', id + ': ' + result);
    assert.equal(await run(record + '.disabled'), false);
    await run(record + '.click()');
    await check('document.querySelector("#practice-letter-state").textContent === ' + JSON.stringify(id === 'manzana' ? 'Aprendida' : '1/3 días'));
    assert.equal(await run(record + '.disabled'), true);
    await clickCamera();
  }
  await navigateTo('progreso');
  await check('!!document.querySelector(".vocabulary-index .letter-mastered")');
  assert.deepEqual(await run('[...document.querySelectorAll(".vocabulary-index .letter-mastered strong")].map(node => node.textContent)'), ['Manzana']);
  assert.deepEqual(errors, []);
  console.log('Edge: dos unidades, seis muestras con cámara simulada, registro por seña y tercera fecha en verde.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
