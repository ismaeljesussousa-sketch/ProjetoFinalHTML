
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[rand(0, arr.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const COLORS = { critico: 'var(--red)', aviso: 'var(--yellow)', bloqueado: 'var(--green)' };


const root = document.documentElement;
let fontPct = 100;
const setFont = v => { fontPct = Math.min(150, Math.max(80, v)); root.style.fontSize = fontPct + '%'; };
$('#btn-font-up').onclick = () => setFont(fontPct + 10);
$('#btn-font-down').onclick = () => setFont(fontPct - 10);
$('#btn-font-reset').onclick = () => setFont(100);
$('#btn-contrast').onclick = e => {
  const on = root.classList.toggle('inverted'); // aplica filter: invert(1)
  e.currentTarget.setAttribute('aria-pressed', on);
};


$('#login-form').onsubmit = e => {
  e.preventDefault();
  if (!$('#user').value.trim() || !$('#pass').value.trim()) {
    $('#login-msg').textContent = 'Preencha usuário e senha.';
    return;
  }
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  startMonitoring();
  buildMap();
  buildCams();
};
$('#btn-logout').onclick = () => location.reload();


$$('.tab').forEach(tab => tab.onclick = () => {
  $$('.tab').forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', t === tab); });
  $$('.panel').forEach(p => p.hidden = p.id !== 'tab-' + tab.dataset.tab);
  if (tab.dataset.tab !== 'game') endGame(true); // pausa o jogo ao sair da aba
});


const COUNTRIES = ['Rússia', 'China', 'Nigéria', 'EUA', 'Irã', 'Alemanha', 'Coreia do Sul', 'Austrália'];
const ATTACKS = ['Brute Force', 'SQL Injection', 'DDoS', 'XSS', 'Phishing', 'Port Scan'];
const STATUS = { critico: 'Crítico', aviso: 'Aviso', bloqueado: 'Bloqueado' };
let blocked = 12840, active = 3;

function addLog() {
  const status = pick(['bloqueado', 'bloqueado', 'bloqueado', 'aviso', 'critico']);
  const now = new Date().toLocaleTimeString('pt-BR');
  const ip = [rand(11, 223), rand(0, 255), rand(0, 255), rand(1, 254)].join('.');
  const tr = document.createElement('tr');
  tr.className = 'new-row';
  tr.innerHTML = `<td>${ip}</td><td>${pick(COUNTRIES)}</td><td>${pick(ATTACKS)}</td><td>${now}</td>
    <td><span class="badge ${status}">${STATUS[status]}</span></td>`;
  const body = $('#log-body');
  body.prepend(tr);
  if (body.children.length > 12) body.lastChild.remove();
  if (status === 'bloqueado') blocked += rand(1, 6); else active = Math.max(1, active + (Math.random() > .5 ? 1 : -1));
  $('#stat-blocked').textContent = blocked.toLocaleString('pt-BR');
  $('#stat-active').textContent = active;
}
function startMonitoring() {
  for (let i = 0; i < 8; i++) addLog();
  setInterval(addLog, 2500);
}


const proj = ([lon, lat]) => [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
const CONTINENTS = [
  [[-168,66],[-140,70],[-95,72],[-60,60],[-55,48],[-80,25],[-97,18],[-85,10],[-105,22],[-125,40]], // América do Norte
  [[-80,10],[-60,10],[-35,-6],[-40,-23],[-58,-38],[-68,-55],[-75,-45],[-72,-18],[-80,-3]],       // América do Sul
  [[-10,36],[-10,58],[10,70],[40,68],[60,55],[40,40],[28,36],[10,38]],                           // Europa
  [[-17,21],[-6,36],[32,31],[43,12],[51,11],[40,-15],[32,-30],[20,-35],[12,-18],[8,4],[-17,14]], // África
  [[60,55],[100,78],[170,68],[140,45],[122,30],[108,10],[100,3],[80,8],[68,24],[50,30],[40,40]], // Ásia
  [[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[115,-34]]                                  // Oceania
];
const SOURCES = [[37,55],[116,40],[3,6],[-74,40],[51,35],[151,-33],[8,50],[127,37]];
const TARGET = [-47.9, -15.8]; // Datacenter (Brasília)

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
}
function buildMap() {
  const svg = $('#world-map');
  for (let x = 0; x <= 1000; x += 100) el('line', { x1: x, y1: 0, x2: x, y2: 500, class: 'grid-line' }, svg);
  for (let y = 0; y <= 500; y += 100) el('line', { x1: 0, y1: y, x2: 1000, y2: y, class: 'grid-line' }, svg);
  CONTINENTS.forEach(c => el('polygon', { points: c.map(p => proj(p).join(',')).join(' '), class: 'continent' }, svg));
  const [tx, ty] = proj(TARGET);
  el('circle', { cx: tx, cy: ty, r: 7, fill: 'var(--green)', class: 'pulse' }, svg);
  SOURCES.forEach(s => { const [x, y] = proj(s); el('circle', { cx: x, cy: y, r: 3, fill: 'var(--cyan)' }, svg); });

  
  const fire = () => {
    const [sx, sy] = proj(pick(SOURCES));
    const color = pick([COLORS.critico, COLORS.aviso, COLORS.bloqueado]);
    const arc = el('path', { d: `M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 90} ${tx},${ty}`, stroke: color, class: 'arc' }, svg);
    const src = el('circle', { cx: sx, cy: sy, r: 6, fill: color, class: 'pulse' }, svg);
    setTimeout(() => { arc.remove(); src.remove(); }, 2600);
  };
  fire(); setInterval(fire, 900);
}


const CAMS = [
  { code: 'CAM 01 - Sala de Servidores', scene: 'racks' },
  { code: 'CAM 02 - Entrada Principal', scene: 'door' },
  { code: 'CAM 03 - Corredor Norte', scene: 'hall' },
  { code: 'CAM 04 - Perímetro Externo', scene: 'fence' }
];
function sceneSvg(type) {
  const base = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><rect width="320" height="180" fill="#0d1a2b"/>';
  let s = '';
  if (type === 'racks') for (let i = 0; i < 6; i++) {
    s += `<rect x="${12 + i * 52}" y="25" width="42" height="140" fill="#1b2a41" stroke="#22D3EE" stroke-opacity=".5"/>`;
    for (let j = 0; j < 8; j++) s += `<circle cx="${22 + i * 52}" cy="${40 + j * 16}" r="2" fill="${(i + j) % 5 ? '#22C55E' : '#F59E0B'}"/>`;
  }
  if (type === 'door') s = '<rect x="100" y="30" width="120" height="150" fill="#16263b" stroke="#22D3EE" stroke-opacity=".6"/><line x1="160" y1="30" x2="160" y2="180" stroke="#22D3EE" stroke-opacity=".6"/><rect x="0" y="150" width="320" height="30" fill="#0a111d"/>';
  if (type === 'hall') s = '<polygon points="0,0 120,60 200,60 320,0" fill="#14233a"/><polygon points="0,180 120,120 200,120 320,180" fill="#0a111d"/><rect x="120" y="60" width="80" height="60" fill="#22D3EE" fill-opacity=".15" stroke="#22D3EE"/><polyline points="0,0 120,60 0,180 120,120" fill="none" stroke="#22D3EE" stroke-opacity=".3"/>';
  if (type === 'fence') for (let i = 0; i < 16; i++) s += `<line x1="${i * 22}" y1="60" x2="${i * 22}" y2="150" stroke="#22D3EE" stroke-opacity=".5"/>`
    + '<line x1="0" y1="80" x2="320" y2="80" stroke="#22D3EE" stroke-opacity=".5"/><line x1="0" y1="130" x2="320" y2="130" stroke="#22D3EE" stroke-opacity=".5"/>';
  return base + s + '</svg>';
}
function buildCams() {
  const grid = $('#cam-grid');
  CAMS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'cam';
    d.innerHTML = sceneSvg(c.scene) +
      `<span class="cam-ui cam-code">${c.code}</span>
       <span class="cam-ui cam-status">● ONLINE · REC</span>
       <span class="cam-ui cam-time"></span>`;
    grid.appendChild(d);
  });
  const tick = () => $$('.cam-time').forEach(t => t.textContent = new Date().toLocaleString('pt-BR'));
  tick(); setInterval(tick, 1000);
}


let score = 0, best = 0, integrity = 100, spawnTimer = null, running = false;
const area = $('#game-area');

function renderIntegrity() {
  $('#g-bar').style.width = integrity + '%';
  $('#g-bar').style.background = integrity > 60 ? 'var(--green)' : integrity > 30 ? 'var(--yellow)' : 'var(--red)';
  $('#g-integrity').textContent = integrity + '%';
}
function spawnPacket() {
  if (!running) return;
  const p = document.createElement('button');
  p.className = 'packet';
  p.textContent = '☠';
  p.setAttribute('aria-label', 'Pacote malicioso');
  p.style.left = rand(0, area.clientWidth - 48) + 'px';
  p.style.top = rand(0, area.clientHeight - 48) + 'px';
  // Clique = ataque bloqueado
  p.onclick = () => { score += 10; $('#g-score').textContent = score; clearTimeout(p.t); p.remove(); };
  // Tempo esgotado = dano na integridade (reduz com a pontuação)
  p.t = setTimeout(() => {
    if (!p.isConnected) return;
    p.remove();
    integrity = Math.max(0, integrity - 10);
    renderIntegrity();
    if (integrity === 0) endGame(false);
  }, Math.max(600, 1400 - score * 3));
  area.appendChild(p);
  spawnTimer = setTimeout(spawnPacket, Math.max(350, 900 - score * 2)); // dificuldade progressiva
}
function startGame() {
  endGame(true);
  score = 0; integrity = 100; running = true;
  $('#g-score').textContent = 0;
  renderIntegrity();
  $('#g-msg').hidden = true;
  $('#g-start').textContent = 'Reiniciar';
  spawnPacket();
}
function endGame(silent) {
  running = false;
  clearTimeout(spawnTimer);
  $$('.packet', area).forEach(p => { clearTimeout(p.t); p.remove(); });
  if (silent) return;
  best = Math.max(best, score);
  $('#g-best').textContent = best;
  $('#g-msg').hidden = false;
  $('#g-msg').textContent = `Sistema comprometido! Pontos de defesa: ${score}. Clique em Reiniciar.`;
}
$('#g-start').onclick = startGame;