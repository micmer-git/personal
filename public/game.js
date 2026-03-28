const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const locationInfo = document.getElementById('locationInfo');
const promptEl = document.getElementById('prompt');
const askBtn = document.getElementById('askBtn');
const llmOutput = document.getElementById('llmOutput');

const tile = 32;
const world = {
  width: canvas.width,
  height: canvas.height
};

const player = {
  x: 120,
  y: 560,
  speed: 2.4,
  size: 20,
  color: '#f59e0b'
};

const keys = new Set();
let loreData = { locations: [] };
let currentLocation = null;

const zones = [
  { x: 140, y: 500, w: 110, h: 80, terrain: 'town' },
  { x: 460, y: 315, w: 130, h: 90, terrain: 'town' },
  { x: 580, y: 255, w: 130, h: 90, terrain: 'town' },
  { x: 730, y: 145, w: 160, h: 120, terrain: 'town' }
];

function drawBaseMap() {
  ctx.fillStyle = '#0b3b2e';
  ctx.fillRect(0, 0, world.width, world.height);

  // rilievi prealpini
  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = i % 2 ? '#14532d' : '#166534';
    ctx.fillRect(i * 82, 0, 82, 130 + ((i % 3) * 18));
  }

  // asse del fiume Serio (stilizzato)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(85, 610);
  ctx.bezierCurveTo(210, 540, 280, 500, 360, 450);
  ctx.bezierCurveTo(440, 410, 520, 360, 620, 290);
  ctx.bezierCurveTo(690, 250, 760, 220, 830, 170);
  ctx.stroke();

  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 4;
  ctx.stroke();

  // strada principale della valle
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(60, 590);
  ctx.bezierCurveTo(200, 520, 300, 460, 380, 420);
  ctx.bezierCurveTo(470, 375, 560, 330, 650, 260);
  ctx.bezierCurveTo(730, 210, 810, 185, 900, 140);
  ctx.stroke();

  // griglia pixel leggera
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
}

function drawZones() {
  zones.forEach((zone) => {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  });

  loreData.locations.forEach((loc) => {
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(loc.x - 8, loc.y - 8, 16, 16);

    ctx.fillStyle = '#111827';
    ctx.font = '14px sans-serif';
    ctx.fillText(loc.name, loc.x - 30, loc.y - 14);
  });
}

function drawPlayer() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(player.x - player.size / 2 - 2, player.y - player.size / 2 - 2, player.size + 4, player.size + 4);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x - 3, player.y - 8, 2, 2);
  ctx.fillRect(player.x + 1, player.y - 8, 2, 2);
}

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.has('ArrowLeft') || keys.has('a')) dx -= player.speed;
  if (keys.has('ArrowRight') || keys.has('d')) dx += player.speed;
  if (keys.has('ArrowUp') || keys.has('w')) dy -= player.speed;
  if (keys.has('ArrowDown') || keys.has('s')) dy += player.speed;

  player.x = Math.max(player.size / 2, Math.min(world.width - player.size / 2, player.x + dx));
  player.y = Math.max(player.size / 2, Math.min(world.height - player.size / 2, player.y + dy));
}

function nearLocation() {
  return loreData.locations.find((loc) => {
    const dist = Math.hypot(loc.x - player.x, loc.y - player.y);
    return dist < 34;
  });
}

function renderLocationInfo(location) {
  if (!location) {
    locationInfo.innerHTML = '<strong>Esplora la valle</strong><p>Avvicinati a un nodo storico per leggere le fonti di gioco.</p>';
    return;
  }

  const periods = location.periods
    .map((p) => `<li><strong>${p.epoch}:</strong> ${p.text}</li>`)
    .join('');

  locationInfo.innerHTML = `
    <h4>${location.name}</h4>
    <ul>${periods}</ul>
    <p><em>Voce bergamasca:</em> ${location.bergamasco}</p>
    <p><small>Premi E per chiedere all'Archivista dettagli su ${location.name}.</small></p>
  `;
}

async function askArchivist(message) {
  llmOutput.textContent = 'L\'Archivista consulta i codici storici...';

  try {
    const response = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    if (!response.ok) {
      llmOutput.textContent = `Errore: ${data.error || 'richiesta non riuscita'}`;
      return;
    }

    llmOutput.textContent = `[mode: ${data.mode}]\n${data.reply}`;
  } catch (error) {
    llmOutput.textContent = `Errore di rete: ${error.message}`;
  }
}

function loop() {
  updatePlayer();
  drawBaseMap();
  drawZones();
  drawPlayer();

  const nearby = nearLocation();
  if (nearby?.id !== currentLocation?.id) {
    currentLocation = nearby || null;
    renderLocationInfo(currentLocation);
  }

  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  keys.add(event.key);

  if (event.key.toLowerCase() === 'e' && currentLocation) {
    promptEl.value = `Approfondisci ${currentLocation.name}: dammi 3 fatti storici affidabili e un accenno linguistico bergamasco.`;
    askArchivist(promptEl.value);
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key);
});

askBtn.addEventListener('click', () => {
  const message = promptEl.value.trim();
  if (!message) {
    llmOutput.textContent = 'Scrivi una domanda prima di inviare.';
    return;
  }

  askArchivist(message);
});

async function init() {
  const response = await fetch('/api/lore');
  loreData = await response.json();
  renderLocationInfo(null);
  loop();
}

init().catch((error) => {
  llmOutput.textContent = `Errore inizializzazione: ${error.message}`;
});
