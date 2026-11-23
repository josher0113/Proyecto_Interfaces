const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

const originalGreetings = ['Hola', 'Buenos días', 'Hasta luego'];
const externalDemo = 'https://www.youtube.com/watch?v=U40386y9DLQ';
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
  const noOverflow = async () => {
    const { scrollWidth, clientWidth } = await run(
      '({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })',
    );
    assert.ok(scrollWidth <= clientWidth, `Desbordamiento horizontal: ${scrollWidth}px en ${clientWidth}px`);
  };
  const checkReference = async (greeting, reference) => {
    const photos = 'Array.from(document.querySelectorAll(".greeting-poses img"))';
    assert.ok(reference.images.length || reference.videoUrl, greeting + ' debe tener una referencia visual.');
    assert.deepEqual(await run(photos + '.map(image => image.getAttribute("src"))'), reference.images);
    await check(photos + '.every(image => image.complete && image.naturalWidth > 0)');
    if (reference.videoUrl) assert.ok(await run('Boolean(' + link(reference.videoUrl) + ')'));
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#aprender');
  await title('Ruta de aprendizaje');
  await run(cameraFixture);
  await clickLink('#saludos');
  await title('Saludos básicos');
  await noQuestions();
  await noOverflow();

  const manifest = await run('Object.entries(greetingReferences)');
  assert.ok(manifest.length >= 7, 'La unidad debe ampliar los tres saludos originales.');
  assert.deepEqual(manifest.slice(0, 3).map(([greeting]) => greeting), originalGreetings);
  assert.equal(manifest[2][1].videoUrl, externalDemo);
  const lessonLinks = await run('Array.from(document.querySelectorAll(\'main a[href^="#leccion/2/"]\'), a => a.getAttribute("href"))');
  assert.deepEqual(lessonLinks.sort(), manifest.map((_, step) => '#leccion/2/' + step).sort());

  for (const [step, [greeting, reference]] of manifest.entries()) {
    const lesson = '#leccion/2/' + step;
    await clickLink(lesson);
    await title(greeting);
    await checkReference(greeting, reference);
    await noQuestions();
    await noOverflow();
    await clickLink('#practica/2/' + step);
    await check('location.hash === "#practica/2/' + step + '" && Boolean(' + toggle + ')');
    await title(greeting);
    await checkReference(greeting, reference);
    await noQuestions();
    assert.ok(await run(video + '.hidden'));
    assert.equal(await run('Boolean(document.querySelector("#gesture-status, #gesture-overlay, #practice-record"))'), false);
    await noOverflow();
    await clickLink(lesson);
    await check('location.hash === "#leccion/2/' + step + '" && !' + toggle);
    await goTo('#saludos');
    await title('Saludos básicos');
  }

  await goTo('#ejercicio-saludos');
  await check('document.querySelector("h1")?.textContent === "Saludos básicos" && !document.querySelector("#greeting-exercise")');
  await noQuestions();
  assert.equal(await run('cameraRequests.length'), 0);

  const activateCamera = async () => {
    await run(toggle + '.click()');
    await check(video + ' && !' + video + '.hidden && ' + video + '.videoWidth > 0');
    assert.equal(await run('new DOMMatrixReadOnly(getComputedStyle(' + video + ').transform).a'), -1);
  };

  await goTo('#practica/2/0');
  await check('Boolean(' + toggle + ')');
  await activateCamera();
  assert.equal(await run('cameraTracks[0].readyState'), 'live');
  assert.equal(await run('cameraRequests[0].audio'), false);
  await run(toggle + '.click()');
  await check(video + '.hidden && cameraTracks[0].readyState === "ended"');

  await activateCamera();
  assert.equal(await run('cameraTracks[1].readyState'), 'live');
  await clickLink('#practica/2/1');
  await title('Buenos días');
  await check('cameraTracks[1].readyState === "ended" && ' + video + '.hidden');
  assert.equal(await run('cameraRequests.length'), 2);

  await goTo('#ejercicio-numeros');
  await title('Números');
  await noQuestions();
  await clickLink('#leccion/1/0');
  await title('Número 1');
  await noQuestions();
  await clickLink('#practica/1/0');
  await check('location.hash === "#practica/1/0" && Boolean(document.querySelector("#gesture-status"))');
  await noQuestions();
  assert.equal(requests.some(path => /hand-worker|mediapipe|hand-practice/.test(path)), false);
  assert.deepEqual(errors, []);
}

runBrowserTest(greetingsScenario).then(() => {
  console.log('Edge: fichas ampliadas de Saludos, vista de 320 px y práctica con cámara en espejo, sin cuestionario.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
