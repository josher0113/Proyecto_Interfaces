const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

const greetings = [
  { title: 'Hola', photos: 2 },
  { title: 'Buenos días', photos: 4 },
  { title: 'Hasta luego', photos: 0 },
];
const externalDemo = 'https://www.youtube.com/watch?v=U40386y9DLQ';
const exerciseForm = 'document.querySelector("#greeting-exercise")';
const feedback = exerciseForm + '.querySelector("[role=status]").textContent';

async function greetingsScenario({ send, run, check, navigate, errors, requests }) {
  const title = text => check('document.querySelector("h1")?.textContent === ' + JSON.stringify(text));
  const link = hash => `document.querySelector('a[href="${hash}"]')`;
  const clickLink = hash => run(link(hash) + '.click()');
  const noOverflow = async () => {
    const { scrollWidth, clientWidth } = await run(
      '({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })',
    );
    assert.ok(scrollWidth <= clientWidth, `Desbordamiento horizontal: ${scrollWidth}px en ${clientWidth}px`);
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#aprender');
  await title('Ruta de aprendizaje');
  await run(`window.cameraRequests = 0;
    navigator.mediaDevices.getUserMedia = () => {
      window.cameraRequests++;
      return Promise.reject(new Error('El repaso de Saludos debe funcionar sin cámara.'));
    };`);
  assert.equal(await run(link('#saludos') + '.textContent.trim()'), 'Explorar saludos');
  await clickLink('#saludos');
  await title('Saludos básicos');
  await noOverflow();

  for (const [step, greeting] of greetings.entries()) {
    const route = '#leccion/2/' + step;
    await check('Boolean(' + link(route) + ')');
    await clickLink(route);
    await title(greeting.title);
    await check(`Array.from(document.querySelectorAll('.greeting-poses img')).filter(image => image.naturalWidth > 0).length === ${greeting.photos}`);
    assert.equal(await run('document.querySelectorAll(".greeting-poses img").length'), greeting.photos);
    assert.equal(await run('Boolean(' + link('#ejercicio-saludos') + ')'), true);
    if (!greeting.photos) assert.equal(await run('Boolean(' + link(externalDemo) + ')'), true);
    await noOverflow();
    if (step < greetings.length - 1) {
      await run('location.hash = "#saludos"');
      await title('Saludos básicos');
    }
  }

  await clickLink('#ejercicio-saludos');
  await check('Boolean(' + exerciseForm + ')');
  const formTitle = await run('document.querySelector("h1").textContent');
  assert.match(formTitle, /saludos/i);
  await run('location.hash = "#saludos"');
  await title('Saludos básicos');
  await run('location.hash = "#practica/2/0"');
  await check('location.hash === "#practica/2/0" && Boolean(' + exerciseForm + ')');
  await noOverflow();
  assert.equal(await run(exerciseForm + '.checkValidity()'), false);

  const choose = (index, answer) => run(`Array.from(${exerciseForm}.querySelectorAll('input[name="answer-${index}"]'))
    .find(input => input.value === ${JSON.stringify(answer)}).click()`);
  const submit = () => run(exerciseForm + '.querySelector("button").click()');
  await choose(0, 'Hola');
  await choose(1, 'Hasta luego');
  await choose(2, 'Hola');
  assert.equal(await run(exerciseForm + '.checkValidity()'), true);
  await submit();
  const firstResult = await run(feedback);
  assert.match(firstResult, /2\s+de\s+3/);

  await choose(0, 'Buenos días');
  await submit();
  const secondResult = await run(feedback);
  assert.match(secondResult, /complet|3\s+de\s+3|todas/i);
  assert.notEqual(secondResult, firstResult);

  assert.equal(await run('window.cameraRequests'), 0);
  assert.equal(await run('Boolean(document.querySelector("#camera-video, #camera-toggle"))'), false);
  assert.equal(requests.some(path => /hand-worker|mediapipe|hand-practice/.test(path)), false);
  assert.deepEqual(errors, []);
}

runBrowserTest(greetingsScenario).then(() => {
  console.log('Edge: tres fichas de Saludos a 320 px, seis fotos, enlace al video y repaso con reintento.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
