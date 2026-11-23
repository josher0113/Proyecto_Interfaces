const units = [
  ['Abecedario', 'Explora el alfabeto manual y su uso para deletrear.', 60, ['Letra A', 'Letra B', 'Letra C']],
  ['Números', 'Familiarízate con los números en situaciones habituales.', 0, ['Número 1', 'Número 2', 'Número 3']],
  ['Saludos básicos', 'Empieza a saludar y despedirte.', 0, ['Hola', 'Buenos días', 'Hasta luego']],
  ['Expresiones cotidianas', 'Amplía tu repertorio de expresiones de uso diario.', 0, ['Gracias', 'Por favor', 'Disculpa']],
  ['Frases y comunicación básica', 'Explora situaciones sencillas de conversación.', 0, ['Presentarse', 'Pedir ayuda', 'Invitar a participar']],
];

const app = document.querySelector('#app');
const brand = 'Conecta <small>LSM</small>';
const media = (label, note) => `<div class="media"><span aria-hidden="true">▣</span><strong>${label}</strong><span>${note}</span></div>`;
const link = (href, label, secondary = false) =>
  `<a class="button ${secondary ? 'secondary' : ''}" href="#${href}">${label}</a>`;
const meter = (label, value) =>
  `<div class="meter"><span>${label}</span><span>${value}%</span><progress aria-label="${label}" value="${value}" max="100"></progress></div>`;
const heading = (label, title, description) => `<header class="page-heading"><p class="eyebrow">${label}</p>
  <h1>${title}</h1><p>${description}</p></header>`;
const stats = () => `<div class="stats"><article><strong>4</strong><span>días de racha</span></article>
  <article><strong>6</strong><span>lecciones completadas</span></article></div>`;

function welcome() {
  return `<div class="welcome"><section><a class="brand" href="#bienvenida">${brand}</a>
    <p class="eyebrow">Lengua de Señas Mexicana</p><h1>Aprende a comunicarte en LSM.</h1>
    <p>Explora la Lengua de Señas Mexicana con lecciones breves, práctica guiada y un espacio de consulta.</p>
    <div class="actions">${link('inicio', 'Comenzar')}<button class="secondary" data-note="El inicio de sesión se habilitará en una etapa posterior.">Iniciar sesión</button></div>
    <p class="feedback" role="status"></p></section>
    <div class="cover"><div class="bubbles" aria-hidden="true"><span>“</span><span>…”</span></div><p>Lengua de Señas Mexicana</p></div></div>`;
}

function dashboard() {
  return `${heading('Tu espacio de aprendizaje', 'Hola, Alex', 'Continúa con tu ruta de Lengua de Señas Mexicana.')}
    <div class="grid"><article class="feature"><p class="eyebrow">Continúa tu lección</p><h2>Abecedario</h2>
      <p>Letra B · Alfabeto manual</p>${link('leccion/0/1', 'Continuar lección')}</article>
      <article><h2>Esta semana</h2>${stats()}${meter('Meta semanal', 60)}</article>
    </div><article class="quick"><div><h2>Traductor LSM</h2><p>Explora la vista de consulta de expresiones en español.</p></div>
      ${link('traductor', 'Abrir traductor', true)}</article>`;
}

function learning() {
  return `${heading('Aprender', 'Ruta de aprendizaje', 'Avanza desde el alfabeto manual hasta situaciones cotidianas.')}
    <div class="units">${units.map(([title, description, progress], index) => `<article class="unit">
      <span class="unit-number" aria-label="Unidad ${index + 1}">${index + 1}</span>
      <div><p class="eyebrow">${['En progreso', 'Disponible', 'Pendiente'][Math.min(index, 2)]}</p>
      <h2>${title}</h2><p>${description}</p>${meter('Progreso de la unidad', progress)}</div>
      ${link(`leccion/${index}/${index === 0 ? 1 : 0}`, index === 0 ? 'Continuar' : 'Comenzar', index !== 0)}
    </article>`).join('')}</div>`;
}

function lesson(unit, index, step) {
  const [title, description, , topics] = unit;
  return `<a class="back" href="#aprender">← Ruta de aprendizaje</a>
    ${heading(title, topics[step], description)}
    <article>${meter(`Paso ${step + 1} de ${topics.length}`, Math.round((step + 1) / topics.length * 100))}
      ${media('Demostración', 'Material en LSM pendiente de incorporar')}
      <p>Este espacio mostrará una demostración validada y una explicación de la seña para esta lección.</p>
      <div class="actions"><button class="secondary" disabled>Repetir demostración</button>${link(`practica/${index}/${step}`, 'Ir a práctica')}</div>
    </article><div class="between actions">
      ${step > 0 ? link(`leccion/${index}/${step - 1}`, 'Anterior', true) : '<button class="secondary" disabled>Anterior</button>'}
      ${step + 1 < topics.length ? link(`leccion/${index}/${step + 1}`, 'Siguiente') : link('aprender', 'Volver a la ruta')}
    </div>`;
}

function practice(unit, index, step) {
  return `<a class="back" href="#leccion/${index}/${step}">← Volver a la lección</a>
    ${heading('Práctica con cámara', unit[3][step], 'Cuando la práctica esté habilitada, coloca tus manos dentro del encuadre y busca buena iluminación.')}
    <div class="grid"><article><h2>Referencia</h2>${media('Ejemplo', 'Demostración pendiente')}</article>
    <article><h2>Vista de cámara</h2>${media('Encuadre de práctica', 'Cámara pendiente de habilitar')}</article></div>
    <article class="quick"><div><h2>Retroalimentación</h2><p class="feedback" role="status">Aquí aparecerán las observaciones de tu práctica.</p></div>
    <button data-note="La cámara y el reconocimiento se incorporarán en una etapa posterior.">Comenzar práctica</button></article>`;
}

function translator() {
  return `${heading('Consulta educativa', 'Traductor LSM', 'Explora cómo se consultarán expresiones validadas en Lengua de Señas Mexicana.')}
  <div class="grid translation"><article><form id="translate">
  <h2><label for="phrase">Escribe en español</label></h2><textarea required maxlength="300" id="phrase" placeholder="Por ejemplo: Buenos días"></textarea>
  <div class="actions"><button type="button" class="secondary" disabled><span aria-hidden="true">🎙</span> Dictar</button>
  <button>Traducir</button></div><p>Dictado pendiente de habilitar.</p></form></article>
  <article><h2>Resultado en LSM</h2>${media('Vista de demostración', 'Material validado pendiente')}
  <div class="actions"><button class="secondary" disabled>Reproducir</button><button class="secondary" disabled>Pausar</button><button class="secondary" disabled>Repetir</button></div>
  <p class="feedback" role="status">Aquí aparecerá una explicación de la expresión cuando haya material disponible.</p></article></div>`;
}

function profile() {
  return `${heading('Tu perfil', 'Progreso', 'Consulta tus estadísticas de ejemplo y días de práctica.')}
    <article class="quick"><div class="identity"><span class="avatar" aria-hidden="true">A</span><h2>Alex Rivera</h2></div>${stats()}</article>
    <div class="grid"><article><h2>Progreso por unidad</h2>${units.map(([title, , progress]) => meter(title, progress)).join('')}</article>
    <article><h2>Calendario de práctica</h2><p>Semana de ejemplo</p><ol class="calendar">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) =>
      `<li><span>${day}</span><span class="${index < 4 ? 'checked' : ''}" aria-label="${index < 4 ? 'Práctica completada' : 'Sin práctica'}">${index < 4 ? '✓' : '·'}</span></li>`).join('')}</ol>
      <h2>Logros</h2><p>Primer paso · Primera lección completada</p><h2>Actividad reciente</h2><p>Abecedario · Practicaste la letra A</p></article></div>`;
}

const pages = { inicio: dashboard, aprender: learning, traductor: translator, progreso: profile };
const nav = [['inicio', '⌂', 'Inicio'], ['aprender', '▤', 'Aprender'], ['traductor', '⇄', 'Traductor'], ['progreso', '◉', 'Progreso']];

function render() {
  const [page, unitParam, stepParam] = location.hash.slice(1).split('/');
  const index = Number(unitParam);
  const step = Number(stepParam);
  const unit = units[index];
  const isLesson = page === 'leccion' || page === 'practica';
  const active = isLesson ? 'aprender' : page;
  const content = isLesson
    ? (unit?.[3][step] ? (page === 'leccion' ? lesson : practice)(unit, index, step) : learning())
    : (Object.hasOwn(pages, page) ? pages[page]() : null);
  app.innerHTML = content ? `<aside><a class="brand" href="#bienvenida">${brand}</a>
    <nav aria-label="Navegación principal">${nav.map(([href, icon, label]) => `<a href="#${href}" ${href === active ? 'aria-current="page"' : ''}>
      <span aria-hidden="true">${icon}</span>${label}</a>`).join('')}</nav></aside>
    <main id="contenido" tabindex="-1">${content}</main>` :
    `<main id="contenido" class="landing" tabindex="-1">${welcome()}</main>`;
  document.title = `${app.querySelector('h1').textContent} | Conecta LSM`;
}

app.addEventListener('click', event => {
  const button = event.target.closest('[data-note]');
  if (button) app.querySelector('.feedback').textContent = button.dataset.note;
});

app.addEventListener('submit', event => {
  event.preventDefault();
  const phrase = event.target.querySelector('textarea').value.trim();
  app.querySelector('.feedback').textContent = phrase
    ? `La consulta «${phrase}» se registró en la vista de demostración. El material en LSM está pendiente.`
    : 'Escribe una palabra o frase para consultar.';
});

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  app.querySelector('main').focus();
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
  app.querySelector('main').focus();
});
render();
