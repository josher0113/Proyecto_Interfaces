const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { existsSync, createReadStream, mkdtempSync, realpathSync, rmSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const { resolve, join, extname, dirname, basename } = require('node:path');

const root = resolve(__dirname, '..');
const browserPath = process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profilePrefix = 'linguaplay-test-edge-';
const mediaTypes = new Map(Object.entries({
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.task': 'application/octet-stream',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.json': 'application/json', '.txt': 'text/plain',
}));

function getBrowserPort(browser) {
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

async function runBrowserTest(scenario, args = []) {
  const profile = mkdtempSync(join(tmpdir(), profilePrefix));
  let browser;
  let blocked = null;
  let socket;
  const requests = [];
  const server = createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }
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

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    browser = spawn(browserPath, [
      '--headless', '--no-first-run', ...args,
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
    ], { windowsHide: true });
    const port = await getBrowserPort(browser);
    const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const page = targets.find(target => target.type === 'page' && target.url === 'about:blank');
    assert.ok(page, 'Edge no abrió la pestaña de prueba.');
    socket = new WebSocket(page.webSocketDebuggerUrl);
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
      const { result, exceptionDetails } = await send('Runtime.evaluate', {
        expression, awaitPromise: true, returnByValue: true,
      });
      if (exceptionDetails) throw Error(exceptionDetails.exception?.description || exceptionDetails.text);
      return result.value;
    }
    async function check(expression, milliseconds = 10000) {
      const timeout = Date.now() + milliseconds;
      do {
        try {
          if (await run(expression)) return;
        } catch (error) {
          if (!/context (?:was destroyed|with specified id)|target navigated/.test(error.message)) throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 80));
      } while (Date.now() < timeout);
      const status = await run('Array.from(document.querySelectorAll(\'[role="status"]\'), node => node.textContent).join(" | ")');
      throw Error(expression + ' / Estado: ' + status + ' / Errores: ' + errors.join(', '));
    }
    const origin = 'http://127.0.0.1:' + server.address().port;
    async function navigate(route = '') {
      const url = origin + '/' + route;
      await send('Page.navigate', { url });
      await check('document.readyState === "complete" && location.href === ' + JSON.stringify(url));
    }
    await send('Runtime.enable');
    await scenario({ send, run, check, navigate, errors, requests, blockRequests: pattern => { blocked = pattern; } });
  } finally {
    socket?.close();
    server.close();
    if (browser?.pid && browser.exitCode === null && browser.signalCode === null) {
      const exited = once(browser, 'exit').catch(() => {});
      browser.kill();
      await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1500))]);
    }
    try {
      const resolved = realpathSync(profile);
      assert.equal(dirname(resolved), realpathSync(tmpdir()));
      assert.ok(basename(resolved).startsWith(profilePrefix));
      rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch (error) {
      console.warn('No se pudo limpiar el perfil temporal de Edge:', error.message);
    }
  }
}

module.exports = { runBrowserTest };
