(function(){
  const canvas = document.getElementById('room');
  const ctx = canvas.getContext('2d');
  const toast = document.getElementById('toast');
  const overlay = document.getElementById('overlay');
  const desc = document.getElementById('desc');

  // Feature flags
  const DEV = true;
  let REDUCED_MOTION = false;
  let HIGH_CONTRAST = false;
  let MUTED = false;

  // Deterministic seed
  const url = new URL(window.location.href);
  let seed = parseInt(url.searchParams.get('seed') || '0', 10);
  function rand(){
    // LCG for repeatability
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  // State machine
  const STATE = { IDLE:0, ENTERING:1, ACTIVE:2, COMPLETE:3, RESET:4 };
  let state = STATE.ENTERING;
  let echoTrails = [];
  let lastPingAt = 0;
  let lastTransitions = [];

  function logTransition(next){
    lastTransitions.push({t: Date.now(), state, next});
    if (lastTransitions.length > 3) lastTransitions.shift();
    state = next;
  }

  // Timer
  let startTime = performance.now();
  let elapsed = 0;
  let paused = false;

  function pause(){ paused = true; }
  function resume(){ paused = false; startTime = performance.now() - elapsed; }

  // Audio (placeholder)
  const pingSfx = new Audio();
  pingSfx.src = ''; // TODO: add SFX file path
  function playPing(){
    if (!MUTED && pingSfx.src) pingSfx.play().catch(()=>{});
  }

  // UI: Toast helpers
  let toastTimer = null;
  function showToast(text, ms=2800){
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ toast.hidden = true; }, ms);
  }
  function dismissToast(){
    toast.hidden = true;
  }

  // Events
  canvas.addEventListener('click', doPing);
  window.addEventListener('keydown', (e)=>{
    if (e.key === ' '){ e.preventDefault(); doPing(); }
    else if (e.key.toLowerCase() === 'i'){ toggleInfo(); }
    else if (e.key.toLowerCase() === 'm'){ MUTED = !MUTED; }
    else if (e.key.toLowerCase() === 'r'){ REDUCED_MOTION = !REDUCED_MOTION; }
    else if (e.key.toLowerCase() === 'h'){ HIGH_CONTRAST = !HIGH_CONTRAST; document.body.classList.toggle('high-contrast', HIGH_CONTRAST); }
    else if (e.key === 'Escape' || e.key === 'Enter'){ dismissToast(); if(state===STATE.COMPLETE) logTransition(STATE.RESET); }
  });

  function toggleInfo(){
    const isHidden = desc.classList.toggle('hidden');
    if (!isHidden) desc.focus?.();
  }

  function doPing(){
    if (state !== STATE.ACTIVE && state !== STATE.ENTERING) return;
    playPing();
    lastPingAt = performance.now();
    const x = canvas.width * (0.2 + 0.6 * rand());
    const y = canvas.height * (0.2 + 0.6 * rand());
    echoTrails.push({x,y,t:lastPingAt});
    if (echoTrails.length > 12) echoTrails.shift();
    // Win condition demo
    if (rand() > 0.7){
      logTransition(STATE.COMPLETE);
      showToast('Room Complete');
      pause();
    }
  }

  function drawEchoes(now){
    for (let i = echoTrails.length - 1; i >= 0; i--){
      const e = echoTrails[i];
      const age = (now - e.t) / 1000; // seconds
      if (age > 3){ echoTrails.splice(i,1); continue; }
      const alpha = Math.max(0, 1 - age/3);
      const radius = 10 + 140 * (age/3);
      ctx.beginPath();
      ctx.arc(e.x, e.y, radius, 0, Math.PI*2);
      if (REDUCED_MOTION){
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(255,105,180,1)'; // pinky sonar
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  function draw(now){
    // bg
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = HIGH_CONTRAST ? '#000' : '#0b0b10';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // center point
    ctx.fillStyle = HIGH_CONTRAST ? '#fff' : '#eaeaf2';
    ctx.fillRect(canvas.width/2-2, canvas.height/2-2, 4, 4);

    // echoes
    drawEchoes(now);

    // caption
    ctx.fillStyle = HIGH_CONTRAST ? '#fff' : 'rgba(255,255,255,0.75)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Press Space/Click to ping • i=info m=mute h=contrast r=reduced', 16, canvas.height - 16);
  }

  function loop(now){
    if (!paused) elapsed = now - startTime;

    switch(state){
      case STATE.ENTERING:
        resume();
        logTransition(STATE.ACTIVE);
        break;
      case STATE.COMPLETE:
        // wait for dismissal; timer paused
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

  // Dev glitch overlay (only logs to console for this scaffold)
  window.addEventListener('error', () => {
    if (DEV) console.warn('Glitch overlay – last transitions:', JSON.stringify(lastTransitions));
  });

  requestAnimationFrame(loop);
})();