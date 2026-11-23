const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

const guideUnits = [
  { unit: 2, route: '#saludos', title: 'Saludos básicos', manifest: 'greetingReferences',
    titles: ['Hola', 'Buenos días', 'Buenas tardes', 'Buenas noches', '¿Cómo estás?', 'Adiós'] },
  { unit: 3, route: '#expresiones', title: 'Expresiones cotidianas', manifest: 'expressionReferences',
    titles: ['Gracias', 'Por favor', 'Perdón', 'De nada', 'Con permiso'] },
];
const video = 'document.querySelector("#camera-video")';
const toggle = 'document.querySelector("#camera-toggle")';

const cameraFixture = `(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext('2d');
  let frame = 0;
  setInterval(() => {
    context.fillStyle = frame++ % 2 === 0 ? '#a64' : '#46a';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, 40);
  window.cameraRequests = [];
  window.cameraTracks = [];
  navigator.mediaDevices.getUserMedia = async constraints => {
    window.cameraRequests.push(constraints);
    const stream = canvas.captureStream(24);
    window.cameraTracks.push(...stream.getVideoTracks());
    return stream;
  };
})()`;

async function greetingsScenario({ send, run, check, navigate, errors, requests }) {
  const title = text => check('document.querySelector("h1")?.textContent === ' + JSON.stringify(text));
  const goTo = hash => run('location.hash = ' + JSON.stringify(hash));
  const link = href => 'document.querySelector(' + JSON.stringify('a[href="' + href + '"]') + ')';
  const clickLink = href => run(link(href) + '.click()');
  const noQuestions = async () => {
    assert.equal(await run('Boolean(document.querySelector("main form, main input[type=radio]"))'), false);
    assert.equal(await run('Boolean(document.querySelector(\'main a[href^="#ejercicio"]\'))'), false);
  };
  const noExternal = async () => {
    const outside = await run(`[...document.querySelectorAll('a[href], img[src], video[src], iframe[src], source[src]')]
      .map(node => node.href || node.src)
      .filter(url => url && new URL(url).origin !== location.origin)`);
    assert.deepEqual(outside, []);
  };
  const noOverflow = async () => {
    const { scrollWidth, clientWidth } = await run(
      '({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })',
    );
    assert.ok(scrollWidth <= clientWidth, `Desbordamiento horizontal: ${scrollWidth}px en ${clientWidth}px`);
  };
  const checkReference = async reference => {
    const photos = 'Array.from(document.querySelectorAll(".reference-poses img"))';
    assert.ok(reference.images.length, reference.title + ' debe tener fotografías locales.');
    assert.deepEqual(await run(photos + '.map(image => image.getAttribute("src"))'), reference.images);
    await check(photos + '.every(image => image.complete && image.naturalWidth > 0)');
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#aprender');
  await title('Ruta de aprendizaje');
  await run(cameraFixture);
  for (const guide of guideUnits) {
    await goTo('#aprender');
    await title('Ruta de aprendizaje');
    await clickLink(guide.route);
    await title(guide.title);
    await noQuestions();
    await noExternal();
    await noOverflow();

    const manifest = await run(guide.manifest);
    const available = [...manifest.entries()].filter(([, reference]) => reference);
    assert.deepEqual(available.map(([, reference]) => reference.title), guide.titles);
    assert.deepEqual(await run('Array.from(document.querySelectorAll(".reference-links a"), a => a.getAttribute("href"))'),
      available.map(([step]) => '#leccion/' + guide.unit + '/' + step));

    for (const [step, reference] of available) {
      const lesson = '#leccion/' + guide.unit + '/' + step;
      const practice = '#practica/' + guide.unit + '/' + step;
      await clickLink(lesson);
      await title(reference.title);
      await checkReference(reference);
      await noQuestions();
      await noExternal();
      await noOverflow();
      await clickLink(practice);
      await check('location.hash === ' + JSON.stringify(practice) + ' && Boolean(' + toggle + ')');
      await title(reference.title);
      await checkReference(reference);
      await noQuestions();
      await noExternal();
      assert.ok(await run(video + '.hidden'));
      assert.equal(await run('Boolean(document.querySelector("#gesture-status, #gesture-overlay, #practice-record"))'), false);
      await noOverflow();
      await clickLink(lesson);
      await check('location.hash === ' + JSON.stringify(lesson) + ' && !' + toggle);
      await goTo(guide.route);
      await title(guide.title);
    }
  }

  for (const retired of ['#leccion/2/2', '#practica/2/2']) {
    await goTo(retired);
    await title('Saludos básicos');
    await check('!!document.querySelector(".reference-links") && !' + toggle);
  }
  await goTo('#leccion/2/1');
  await title('Buenos días');
  await clickLink('#leccion/2/3');
  await title('Buenas tardes');

  await goTo('#ejercicio-saludos');
  await check('document.querySelector("h1")?.textContent === "Saludos básicos" && !document.querySelector("#greeting-exercise")');
  await noQuestions();
  assert.equal(await run('cameraRequests.length'), 0);

  const activateCamera = async () => {
    await run(toggle + '.click()');
    await check(video + ' && !' + video + '.hidden && ' + video + '.videoWidth > 0');
    assert.equal(await run('new DOMMatrixReadOnly(getComputedStyle(' + video + ').transform).a'), -1);
  };

  await goTo('#practica/3/0');
  await check('Boolean(' + toggle + ')');
  await activateCamera();
  assert.equal(await run('cameraTracks[0].readyState'), 'live');
  assert.equal(await run('cameraRequests[0].audio'), false);
  await run(toggle + '.click()');
  await check(video + '.hidden && cameraTracks[0].readyState === "ended"');

  await activateCamera();
  assert.equal(await run('cameraTracks[1].readyState'), 'live');
  await clickLink('#practica/3/1');
  await title('Por favor');
  await check('cameraTracks[1].readyState === "ended" && ' + video + '.hidden');
  assert.equal(await run('cameraRequests.length'), 2);

  await goTo('#ejercicio-numeros');
  await title('Números');
  await noQuestions();
  await clickLink('#leccion/1/0');
  await title('Número 1');
  await noQuestions();
  await noExternal();
  await clickLink('#practica/1/0');
  await check('location.hash === "#practica/1/0" && Boolean(document.querySelector("#gesture-status"))');
  await noQuestions();
  await noExternal();
  await goTo('#leccion/0/0');
  await title('Letra A');
  await noExternal();
  await goTo('#leccion/0/9');
  await title('Letra J');
  await noExternal();
  assert.equal(requests.some(path => /hand-worker|mediapipe|hand-practice/.test(path)), false);
  assert.deepEqual(errors, []);
}

runBrowserTest(greetingsScenario).then(() => {
  console.log('Edge: 6 saludos y 5 expresiones con fotos locales, rutas retiradas, cámara en espejo y navegación interna a 320 px.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
