document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('room');
  const ctx = canvas?.getContext('2d');
  const toast = document.getElementById('toast');
  const desc = document.getElementById('desc');

  // Element guards
  if (!canvas || !ctx) {
    console.warn('[Kernel] Canvas not found; aborting init.');
    return;
  }
  if (!toast) console.warn('[Kernel] Toast element missing.');
  if (!desc) console.warn('[Kernel] Description element missing.');

  // Feature flags
  const DEV = true;
  let REDUCED_MOTION = false;
  let HIGH_CONTRAST = false;
  let MUTED = false;

  // Deterministic seed
  const url = new URL(window.location.href);
  let seed = Number.parseInt(url.searchParams.get('seed') || '0', 10);
  if (!Number.isFinite(seed)) seed = 0;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0; // uint32
    return seed / 4294967296;
  }

  // State machine
  const STATE = { IDLE:0, ENTERING:1, ACTIVE:2, COMPLETE:3, RESET:4 };
  let state = STATE.ENTERING;

  // Echo data
  let echoTrails = [];
  let lastTransitions = [];

  function logTransition(next) {
    lastTransitions.push({ t: Date.now(), state, next });
    if (lastTransitions.length > 3) lastTransitions.shift();
    state = next;
  }

  // Timer
  let startTime = performance.now();
  let elapsed = 0;
  let paused = false;
  function pause() { paused = true; }
  function resume() { paused = false; startTime = performance.now() - elapsed; }

  // Audio (optional)
  let pingSfx = null;
  try {
    pingSfx = new Audio(); // leave src empty unless you add an asset
  } catch { /* noop */ }
  function playPing() {
    if (!MUTED && pingSfx && pingSfx.src) {
      pingSfx.play().catch(() => {}); // no console noise
    }
  }

  // Toast helpers
  let toastTimer = null;
  function showToast(text, ms = 2800) {
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, ms);
  }
  function dismissToast() {
    if (!toast) return;
    toast.hidden = true;
    clearTimeout(toastTimer);
  }

  // Info toggle
  function toggleInfo() {
    if (!desc) return;
    desc.classList.toggle('hidden');
  }

  // Input
  canvas.addEventListener('click', doPing);
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === ' ') { e.preventDefault(); doPing(); }
    else if (k.toLowerCase?.() === 'i') toggleInfo();
    else if (k.toLowerCase?.() === 'm') MUTED = !MUTED;
    else if (k.toLowerCase?.() === 'r') REDUCED_MOTION = !REDUCED_MOTION;
    else if (k.toLowerCase?.() === 'h') {
      HIGH_CONTRAST = !HIGH_CONTRAST;
      document.body.classList.toggle('high-contrast', HIGH_CONTRAST);
    }
    else if (k === 'Escape' || k === 'Enter') {
      dismissToast();
      if (state === STATE.COMPLETE) logTransition(STATE.RESET);
    }
  });

  function doPing() {
    if (state !== STATE.ACTIVE && state !== STATE.ENTERING) return;
    playPing();
    const x = canvas.width * (0.2 + 0.6 * rand());
    const y = canvas.height * (0.2 + 0.6 * rand());
    const now = performance.now();
    echoTrails.push({ x, y, t: now });
    if (echoTrails.length > 12) echoTrails.shift();

    // Demo win condition
    if (rand() > 0.7) {
      logTransition(STATE.COMPLETE);
      showToast('Room Complete', 2800);
      pause();
    }
  }

  function drawEchoes(now) {
    for (let i = echoTrails.length - 1; i >= 0; i--) {
      const e = echoTrails[i];
      const age = (now - e.t) / 1000; // s
      if (age > 3) { echoTrails.splice(i, 1); continue; }
      const alpha = Math.max(0, 1 - age / 3);
      const radius = 10 + 140 * (age / 3);

      ctx.beginPath();
      ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
      if (REDUCED_MOTION) {
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#cccccc';
      } else {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,105,180,1)'; // pink sonar
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function draw(now) {
    // Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = HIGH_CONTRAST ? '#000' : '#0b0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center dot
    ctx.fillStyle = HIGH_CONTRAST ? '#fff' : '#eaeaf2';
    ctx.fillRect((canvas.width / 2) - 2, (canvas.height / 2) - 2, 4, 4);

    // Echoes
    drawEchoes(now);

    // Caption
    ctx.fillStyle = HIGH_CONTRAST ? '#fff' : 'rgba(255,255,255,0.8)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Space/Click: ping  •  i: info  m: mute  h: contrast  r: reduced motion', 16, canvas.height - 16);
  }

  function loop(now) {
    if (!paused) elapsed = now - startTime;

    switch (state) {
      case STATE.ENTERING:
        resume();
        logTransition(STATE.ACTIVE);
        break;
      case STATE.COMPLETE:
        // paused until dismissed
        break;
      case STATE.RESET:
        echoTrails = [];
        dismissToast();
        resume();
        logTransition(STATE.ACTIVE);
        break;
    }

    draw(now);
    requestAnimationFrame(loop);
  }

  // Dev “glitch overlay” (console only here)
  window.addEventListener('error', () => {
    if (DEV) console.warn('[Kernel] Last transitions:', JSON.stringify(lastTransitions));
  });

  // Ensure canvas size is sane on load
  if (canvas.width < 100 || canvas.height < 100) {
    canvas.width = 800; canvas.height = 480;
  }

  requestAnimationFrame(loop);
});
