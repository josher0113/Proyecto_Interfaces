const { spawn } = require('node:child_process');
const { existsSync, createReadStream, mkdtempSync, realpathSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { resolve, join, extname, dirname, basename } = require('node:path');
const { once } = require('node:events');
const assert = require('node:assert/strict');

const root = resolve(__dirname, '..');
const browserPath = process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = mkdtempSync(join(tmpdir(), 'linguaplay-gesture-edge-'));
const mediaTypes = new Map(Object.entries({
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.task': 'application/octet-stream',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.json': 'application/json', '.txt': 'text/plain',
}));
let blocked = null;
const requests = [];
const server = require('node:http').createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const mime = mediaTypes.get(extname(relative));
  if (!mime || !/^(?:[\wÑ.-]+\/)*[\wÑ.-]+$/.test(relative)
      || relative.split('/').some(part => part === '..' || part === '.')) {
    response.writeHead(404).end();
    return;
  }
  const file = resolve(root, relative);
  requests.push(relative);
  if (!existsSync(file) || (blocked && blocked.test(relative))) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
  const stream = createReadStream(file);
  stream.on('error', () => response.destroy());
  stream.pipe(response);
});
server.listen(0, '127.0.0.1');

const browser = spawn(browserPath, [
  '--headless', '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], { windowsHide: true });

const cameraFixture = `(() => {
  const state = {
    scene: [],
    requests: 0,
    canvas: document.createElement('canvas'),
    denied: false,
    images: {},
    async open() {
      this.requests++;
      if (this.denied) throw new DOMException('Prueba', 'NotAllowedError');
      return this.canvas.captureStream(24);
    },
  };
  state.canvas.width = 640;
  state.canvas.height = 480;
  window.fakeCamera = state;
  navigator.mediaDevices.getUserMedia = state.open.bind(state);
  state.setScene = async (scene) => {
    for (const { letter } of scene) {
      if (!state.images[letter]) {
        const image = new Image();
        image.src = '/assets/abecedario/' + encodeURIComponent(letter) + '.jpg';
        await image.decode();
        state.images[letter] = image;
      }
    }
    state.scene = scene;
  };
  setInterval(() => {
    const ctx = state.canvas.getContext('2d');
    ctx.fillStyle = '#ded8d4';
    ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    for (const { letter, x = 0, y = 0, w = 360, h = 480, mirror = false, angle = 0 } of state.scene) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(angle * Math.PI / 180);
      ctx.scale(mirror ? -1 : 1, 1);
      ctx.drawImage(state.images[letter], -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }, 34);
})()`;

function getBrowserPort() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Edge no inició CDP')), 17000);
    browser.once('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    browser.stderr.on('data', chunk => {
      const match = String(chunk).match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
}

async function viaBrowser(callback) {
  const port = await getBrowserPort();
  if (!server.listening) await once(server, 'listening');
  const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const page = targets.find(target => target.type === 'page' && target.url === 'about:blank');
  assert.ok(page, 'Edge no abrió la pestaña de prueba.');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  const errors = [];
  let id = 0;
  socket.onclose = () => {
    for (const resolve of pending.values()) resolve({ error: { message: 'Edge cerró la conexión de prueba.' } });
    pending.clear();
  };
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  };
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, ({ error, result }) => error ? reject(Error(error.message)) : resolve(result));
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function run(expression) {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw Error(exceptionDetails.exception?.description || exceptionDetails.text);
    return result.value;
  }
  async function check(expression, milliseconds = 10000) {
    const timeout = Date.now() + milliseconds;
    do {
      if (await run(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 80));
    } while (Date.now() < timeout);
    throw Error(expression + ' / Estado: ' + await run('(document.querySelector("#gesture-status")?.textContent || "") + " | " + (document.querySelector("#camera-status")?.textContent || "")') + ' / Errores: ' + errors.join(', '));
  }
  await send('Runtime.enable');
  const origin = 'http://127.0.0.1:' + server.address().port;
  async function navigate(route = '') {
    const url = origin + '/' + route;
    await send('Page.navigate', { url });
    await check('document.readyState === "complete" && location.href === ' + JSON.stringify(url));
  }
  try {
    await callback({ send, run, check, navigate, errors });
  } finally {
    socket.close();
  }
}

async function integration({ send, run, check, navigate, errors }) {

  const status = 'document.querySelector("#gesture-status")?.textContent || ""';
  const active = 'document.querySelector("#camera-toggle").textContent === "Detener cámara"';
  const cameraVideo = 'document.querySelector("#camera-video")';
  const track = cameraVideo + '.srcObject.getVideoTracks()[0]';
  const click = () => run('document.querySelector("#camera-toggle").click()');
  const scene = (images) => run('fakeCamera.setScene(' + JSON.stringify(images) + ')');
  const message = (phrase, milliseconds) => check('(' + status + ').includes(' + JSON.stringify(phrase) + ')', milliseconds);
  const route = (value) => run('location.hash = ' + JSON.stringify(value));
  await navigate('#practica/0/0');
  await run(cameraFixture);
  await check('!!document.querySelector("#camera-toggle")');
  assert.equal(await run('fakeCamera.requests'), 0);
  assert.equal(requests.some(path => path.includes('mediapipe')), false);
  await click();
  await check(active);
  assert.equal(await run(cameraVideo + '.srcObject.getAudioTracks().length'), 0);
  await message('Coloca una mano dentro del encuadre.', 25000);
  await scene([{ letter: 'A', x: 140 }]);
  await message('Letra A detectada. Coincide con la referencia.');
  const overlay = await run('(() => { const canvas = document.querySelector("#gesture-overlay"); return canvas && [canvas.width, canvas.height]; })()');
  assert.deepEqual(overlay, [640, 480]);
  const overlayHasPoints = '(() => { const canvas = document.querySelector("#gesture-overlay"); return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value > 0); })()';
  assert.equal(await run(overlayHasPoints), true);
  await scene([{ letter: 'B', x: 140 }]);
  await message('Letra B detectada. Practica la letra A de esta ficha.');
  await scene([{ letter: 'C', x: 140, mirror: true }]);
  await message('Letra C detectada. Practica la letra A de esta ficha.');
  await scene([{ letter: 'Y', x: 140 }]);
  await message('Mano detectada. No se pudo identificar la letra.');
  await scene([{ letter: 'A', x: 2, y: 45, w: 278, h: 370 }, { letter: 'C', x: 360, y: 45, w: 278, h: 370 }]);
  await message('Muestra una sola mano.');
  await scene([]);
  await message('Coloca una mano dentro del encuadre.');
  assert.equal(await run(overlayHasPoints), false);
  await run('window.lastTrack = ' + track);
  await route('#leccion/0/0');
  await check('window.lastTrack.readyState === "ended"');
  await route('#practica/0/2');
  await check('!!document.querySelector("#camera-toggle")');
  await scene([{ letter: 'C', x: 140 }]);
  await click();
  await message('Letra C detectada. Coincide con la referencia.', 25000);
  await run('window.lastTrack = ' + track);
  await click();
  await check('window.lastTrack.readyState === "ended" && ' + cameraVideo + '.hidden');
  assert.ok(!(await run(status)).includes('detectada'));
  await route('#practica/0/9');
  await check('!!document.querySelector("#camera-toggle")');
  await click();
  await check(active);
  await scene([{ letter: 'A', x: 140 }]);
  await new Promise(resolve => setTimeout(resolve, 700));
  assert.ok(!(await run(status)).includes('Letra A detectada'));
  await route('#practica/0/0');
  await check('!!document.querySelector("#camera-toggle")');
  await run('fakeCamera.denied = true');
  await click();
  await check('document.querySelector("#camera-status").textContent.includes("No se concedió")');
  blocked = /\.task$/;
  await navigate('?modelo=no-disponible#practica/0/0');
  await run(cameraFixture);
  await check('!!document.querySelector("#camera-toggle")');
  await click();
  await check(active);
  await check('/seguimiento|reconocimiento|detector/i.test(' + status + ') && /no se pudo|no (?:está )?disponible/i.test(' + status + ')', 25000);
  assert.equal(await run(track + '.readyState'), 'live');
  await click();
  assert.deepEqual(errors, []);
  console.log('Edge con WASM real y cámara de prueba: A, B, C, mano desconocida, dos manos, encuadre vacío, detención, permiso denegado y modelo inaccesible.');
}


function removeTestProfile() {
  const resolved = realpathSync(profile);
  const temp = realpathSync(tmpdir());
  assert.equal(dirname(resolved), temp);
  assert.ok(basename(resolved).startsWith('linguaplay-gesture-edge-'));
  rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

viaBrowser(integration).catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  server.close();
  if (browser.pid && browser.exitCode === null && browser.signalCode === null) {
    const exited = once(browser, 'exit').catch(() => {});
    browser.kill();
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1500))]);
  }
  try {
    removeTestProfile();
  } catch (error) {
    console.warn('No se pudo limpiar el perfil temporal de Edge:', error.message);
  }
});