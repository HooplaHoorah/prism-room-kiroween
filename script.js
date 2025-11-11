(function () {
  // --- DOM helpers ---
  const el = (id) => document.getElementById(id);

  // Root app / panes
  const app = document.getElementById("app");
  const logEl = el("log");
  const input = el("input");
  const statusBar = el("status");

  // Status meters
  const echoEl = el("echo");
  const fearFill = el("fear_fill");
  const resFill = el("res_fill");
  const fearPct = el("fear_pct");
  const resPct = el("res_pct");
  const rollEl = el("roll");
  const curseEl = el("curse");

  // HUD
  const statTtt = el("stat_ttt");
  const statAttempts = el("stat_attempts");
  const statFails = el("stat_fails");
  const statHints = el("stat_hints");
  const statRoom = el("stat_room");
  const hudLast = el("hud_last");
  const hudSuggest = el("hud_suggest");
  const chipsEl = el("chips");

  // Banner + controls
  const banner = el("eventBanner");
  const bannerText = el("bannerText");
  const bannerClose = el("bannerClose");
  const btnSettings = el("btnSettings");
  const btnReplay = el("btnReplay");
  const dlg = el("settingsModal");

  // Settings toggles
  const chkAudio = el("chkAudio");
  const chkFlash = el("chkFlash");
  const chkCRT = el("chkCRT");
  const chkTube = el("chkTube");
  const chkPhotosafe = el("chkPhotosafe");
  const chkHints = el("chkHints");
  const chkNudges = el("chkNudges");
  const chkChips = el("chkChips");
  const chkEvents = el("chkEvents");
  const btnReset = el("btnReset");

  // --- State ---
  const MAX_LINES = 14;
  const messages = [];

  const state = {
    startTs: Date.now(),
    echo: 1,
    fear: 46,
    resolve: 41,
    roll: 210, // seconds
    curse: 12,

    candleLit: false,
    mirrorMoved: false,
    roomComplete: false,

    inventory: { matchbook: 2, paperclip: 1, "old coin": 1, chalk: 1 },
    shards: { light: 0, sound: 0 },

    attempts: 0,
    fails: 0,
    hintsOffered: 0,
    hintsTaken: 0,
    firstTwistTs: null,

    listened: false,
  };

  const settings = {
    audio: true,
    flash: true,
    crt: true,
    tube: true,
    photosafe: false,

    hints: true,
    hintsNudge: true,
    hintsChips: true,
    hintsEvents: true,
  };

  let lastEvent = "—";
  let pingMuteUntil = 0; // world-ping cooldown window (ms timestamp)
  let worldPingBudget = 2;

  // --- Utilities ---
  const fmtTime = (s) =>
    `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0")}:${String(
      Math.max(0, s) % 60
    ).padStart(2, "0")}`;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function setEcho(n) {
    state.echo = n;
    echoEl.textContent = String(n);
    document.body.classList.remove("echo-2", "echo-3");
    if (n === 2) document.body.classList.add("echo-2");
    if (n === 3) document.body.classList.add("echo-3");
  }

  function updateMeters() {
    fearPct.textContent = clamp(state.fear, 0, 100) + "%";
    resPct.textContent = clamp(state.resolve, 0, 100) + "%";
    if (fearFill) fearFill.style.width = clamp(state.fear, 0, 100) + "%";
    if (resFill) resFill.style.width = clamp(state.resolve, 0, 100) + "%";
    rollEl.textContent = fmtTime(state.roll);
    curseEl.textContent = state.curse + "%";
  }

  function renderLog() {
  logEl.innerHTML = "";
  const start = Math.max(0, messages.length - MAX_LINES);
  for (let i = start; i < messages.length; i++) logEl.appendChild(messages[i]);
  try { requestAnimationFrame(()=>{ logEl.scrollTop = logEl.scrollHeight; const last = logEl.lastElementChild; if(last) last.scrollIntoView({block:'nearest'}); }); } catch(e) {}
}

  const sanitize = (t) =>
    t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  function say(t, cls = "system") {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.innerHTML = '<span class="tag">•</span>' + sanitize(t);
    messages.push(d);
    renderLog();
  }
  function ascii(t) {
    const d = document.createElement("div");
    d.className = "msg ascii";
    d.textContent = t;
    messages.push(d);
    renderLog();
  }
  function card(html, cls = "card") {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.innerHTML = html;
    messages.push(d);
    renderLog();
  }
  let __heroRemoved = false;
  function removeHeroCardOnce(){
    if(__heroRemoved) return;
    __heroRemoved = true;
    document.querySelectorAll('#log .msg.card.hero').forEach(el => el.remove());
  }


  function user(t) {
    const d = document.createElement("div");
    d.className = "msg user";
    d.textContent = "> " + t;
    messages.push(d);
    renderLog();
  }
  function warn(t) {
    say(t, "warn");
  }
  function err(t) {
    say(t, "error");
  }

  function updateStats() {
    statAttempts.textContent = String(state.attempts);
    statFails.textContent = String(state.fails);
    statHints.textContent = `${state.hintsOffered} / ${state.hintsTaken}`;
    statRoom.textContent = state.roomComplete
      ? "Completed"
      : state.roll > 0
      ? "In progress"
      : "Failed";
    if (state.firstTwistTs) {
      const dt = Math.floor((state.firstTwistTs - state.startTs) / 1000);
      statTtt.textContent = fmtTime(dt);
    }
  }

  function setChips(arr) {
    chipsEl.innerHTML = "";
    if (!(settings.hints && settings.hintsChips)) {
      hudSuggest.textContent = "—";
      return;
    }
    arr.forEach((v) => {
      const b = document.createElement("button");
      b.textContent = v;
      b.addEventListener("click", () => {
        input.value = v;
        input.focus();
      });
      chipsEl.appendChild(b);
    });
    hudSuggest.textContent = arr.join(" • ");
  }

  // --- Audio + VFX ---
  let audioCtx = null;
  const ensureAudio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx && audioCtx.state === 'suspended') { try{ audioCtx.resume(); }catch(e){} }
  };

  function ping(freq = 420, dur = 140, gain = 0.03) {
    if (!settings.audio) return;
    ensureAudio();
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.08
      );
      o.stop(audioCtx.currentTime + 0.09);
    }, dur);
  }

  function echoFlash() {
    if (!settings.flash || settings.photosafe) return;
    statusBar.classList.remove("flash");
    void statusBar.offsetWidth; // restart animation
    statusBar.classList.add("flash");
  }

  function tubeMorph() {
    if (!settings.tube || settings.photosafe) return;
    app.classList.remove("tube-on");
    void app.offsetWidth;
    app.classList.add("tube-on");
  }

  // Sonar echo trail (2.6s lingering highlight on status bar)
  function sonarTrail() {
    if (settings.photosafe) return;
    statusBar.classList.remove("sonar", "echo2");
    void statusBar.offsetWidth; // restart animation
    if (state.echo === 2) statusBar.classList.add("sonar", "echo2");
    else statusBar.classList.add("sonar"); // echo-3 pink by default
    setTimeout(() => {
      statusBar.classList.remove("sonar", "echo2");
    }, 2600);
  }

  // World-ping cooldown
  function coolPings(ms = 2000) {
    pingMuteUntil = Date.now() + ms;
  }

  // Event banner (sticky + replay)
  function showBanner(text, kind = "info", sticky = false) {
    lastEvent = text;
    hudLast.textContent = text;
    bannerText.textContent = text.toUpperCase();
    banner.className = "event-banner " + kind + " show" + (sticky ? " sticky" : "");
    if (!sticky) {
      setTimeout(() => banner.classList.remove("show"), 4200);
    }
  }
  bannerClose.addEventListener("click", () => banner.classList.remove("show"));
  btnReplay.addEventListener("click", () => {
    if (lastEvent && lastEvent !== "—") showBanner(lastEvent, "info", true);
  });

  // CRT mask
  function applyCRT() {
    const on = settings.crt && !settings.photosafe;
    document.body.classList.toggle("crt-on", on);
    document.body.classList.toggle("crt-off", !on);
  }

  // --- Timers ---
  // Rolldown every second
  setInterval(() => {
    if (state.roomComplete) return;
    if (state.roll > 0) {
      state.roll--;
      if (settings.audio && (state.roll === 60 || state.roll === 15))
        ping(320, 80, 0.02);

      if (state.roll === 0) {
        warn(
          "The room destabilizes and slides away. Cooldown begins. Type RESET to try again."
        );
        showBanner("Room destabilized — cooldown", "warn", true);
        coolPings(2000);
        sonarTrail();
      }
      updateMeters();
      updateStats();
    }
  }, 1000);

  // Simulated world pings every 3s (budgeted) — respects cooldown
  setInterval(() => {
    if (state.roomComplete || state.roll <= 0 || worldPingBudget <= 0) return;
    if (Date.now() < pingMuteUntil) return;
    if (Math.random() < 0.06) {
      worldPingBudget--;
      const kind = ["stabilize", "destabilize", "clarity", "noise"][
        Math.floor(Math.random() * 4)
      ];
      if (kind === "stabilize") {
        const a = 5;
        state.roll += a;
        say(`WORLD PING: STABILIZE +${a}s FROM AN ADJACENT ROOM.`, "world");
        showBanner(`World ping stabilized +${a}s`, "info");
      }
      if (kind === "destabilize") {
        const a = 3;
        state.roll = Math.max(0, state.roll - a);
        say(`WORLD PING: DESTABILIZE -${a}s FROM A DISTANT FAILURE.`, "warn world");
        showBanner(`World ping destabilized -${a}s`, "warn");
      }
      if (kind === "clarity") {
        if (state.fails > 0) {
          state.fails--;
          say("WORLD PING: Clarity — the room seems to understand you better.");
          showBanner("World ping: clarity", "info");
        }
      }
      if (kind === "noise") {
        state.curse = Math.min(99, state.curse + 1);
        say("WORLD PING: NOISE — A LINE OF TEXT ARRIVES SMUDGED.", "warn world");
        showBanner("World ping: noise", "warn");
      }
      sonarTrail();
      updateMeters();
      updateStats();
    }
  }, 3000);

  // --- Parser ---
  const verbSyn = {
    EXAMINE: "LOOK",
    SEE: "LOOK",
    L: "LOOK",
    READ: "INSPECT",
    VIEW: "LOOK",
    HEAR: "LISTEN",
    IGNITE: "LIGHT",
    "LIGHT UP": "LIGHT",
    "TURN ON": "LIGHT",
    BURN: "LIGHT",
    INV: "INVENTORY",
    I: "INVENTORY",
    CRAFT: "FUSE",
  };
  const objSyn = {
    AREA: "ROOM",
    SPACE: "ROOM",
    SURROUNDINGS: "ROOM",
    MIRROR: "MIRROR SHARD",
    SHARD: "MIRROR SHARD",
    GLASS: "DOOR",
    SEAM: "DOOR",
    NOTE: "NOTE",
    PAPER: "NOTE",
    MATCH: "MATCHBOOK",
    MATCHES: "MATCHBOOK",
  };

  const normalize = (t) =>
    t.trim().toUpperCase().replace(/\bLIGHT UP\b/g, "LIGHT").replace(/\bTURN ON\b/g, "LIGHT");
  const mapObj = (o) => (o ? objSyn[o] || o : o);

  function parseCommand(text) {
    const t = normalize(text);
    let verb = t.split(/\s+/)[0];
    if (verbSyn[verb]) verb = verbSyn[verb];
    const rest = t.slice(verb.length).trim();
    let obj = rest,
      withObj = null;
    const m = rest.match(/(.*)\bWITH\b(.*)/);
    if (m) {
      obj = (m[1] || "").trim();
      withObj = (m[2] || "").trim();
    }
    return { verb, obj: mapObj(obj), withObj: mapObj(withObj), raw: text };
  }

  // Input & hotkeys
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const raw = input.value.trim();
      if (!raw) return;
      input.value = "";
      handle(raw);
    }
  });

  // Alt+I / Alt+H / Alt+R (only when input is NOT focused)
  window.addEventListener("keydown", (e) => {
    if (document.activeElement === input) return;
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key.toLowerCase();
    if (k === "i") {
      e.preventDefault();
      handle("INVENTORY");
    }
    if (k === "h") {
      e.preventDefault();
      handle("HELP");
    }
    if (k === "r") {
      e.preventDefault();
      handle("RESET");
    }
  });

  // --- Command handling ---
  function handle(raw) {
    user(raw);
    const { verb, obj, withObj } = parseCommand(raw);

    if (verb === "HELP") {
      showHelp();
      return;
    }
    if (verb === "RESET") {
      resetRoom();
      return;
    }
    if (verb === "INVENTORY") {
      const items = Object.entries(state.inventory)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${k} (${v})`);
      const shards = Object.entries(state.shards)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${k} shard (${v})`);
      say("INVENTORY: " + (items.concat(shards).join(", ") || "empty"));
      return;
    }

    state.attempts++;
    updateStats();

    // LOOK
    if (verb === "LOOK") {
      if (!obj || obj === "ROOM")
        say(
          "You face an iron door. A prism dangles; candlewax traces a river toward a dusty projector."
        );
      else if (obj === "DOOR")
        say("Flaking red paint. Beneath it: a thin seam of glass.");
      else if (obj === "PRISM")
        say("A small crystal prism turning lazily. It begs for light.");
      else if (obj === "PROJECTOR")
        say("Dusty, unplugged. Yet a whisper counts the seconds: seven... seven... seven.");
      else if (obj === "CANDLE")
        say(
          state.candleLit
            ? "The wick burns low, shadows leaning toward the prism."
            : "A stub of candle, unlit. It smells like ozone."
        );
      else if (obj === "MIRROR SHARD")
        say("A palm-sized shard tucked in the baseboard. You could angle it.");
      else if (obj === "NOTE")
        say("'Red was just the beginning.' Scribbled in a careful hand.");
      else parserFail();
      return;
    }

    // LISTEN
    if (verb === "LISTEN") {
      state.listened = true;
      if (state.echo === 1)
        say("A projector whispers every seven seconds.");
      else if (state.echo === 2)
        say("The whisper shifts... five seconds now.");
      else say("Silence settles in the new geometry of the room.");
      return;
    }

    // LIGHT
    if (verb === "LIGHT") {
      if (obj === "PRISM") {
        if (!state.candleLit) {
          state.fear = clamp(state.fear + 3, 0, 100);
          say("Nothing happens. The room seems to wait for a spark.");
          offerHint();
          updateMeters();
          return;
        }
        if (state.echo === 1) {
          setEcho(2);
          state.fear = clamp(state.fear - 5, 0, 100);
          state.roll = Math.max(0, state.roll - 25);
          say(
            "A thin amber line slices dust; the projector's whisper changes from 7 to 5.",
            "echo2"
          );
          if (!state.firstTwistTs) state.firstTwistTs = Date.now();
          if (settings.audio) ping(430, settings.photosafe ? 100 : 140, 0.035);
          echoFlash();
          showBanner("Echo shift: projector whisper 7s → 5s", "info");
          setTimeout(tubeMorph, 80);
          updateMeters();
          showBanner("Geometry shifted — whisper from 7 → 5", "info");
          sonarTrail();
          if (settings.hints && settings.hintsEvents) setChips(["PULL MIRROR SHARD"]);
          return;
        }
        say("Shards of light sketch triangles on the ceiling.");
        return;
      }
      if (obj === "CANDLE") {
        const hasMatch = state.inventory["matchbook"] > 0;
        const used = !state.candleLit && (hasMatch || withObj === "MATCHBOOK");
        if (state.candleLit) {
          say("The candle is already lit.");
          return;
        }
        if (!used) {
          warn("You fumble for a flame you do not have.");
          return;
        }
        if (hasMatch) state.inventory["matchbook"] -= 1;
        state.candleLit = true;
        state.resolve = clamp(state.resolve + 4, 0, 100);
        say("The wick catches; shadows lean toward the prism.");
        updateMeters();
        if (settings.hints && settings.hintsEvents) setChips(["LIGHT PRISM"]);
        return;
      }
      parserFail();
      return;
    }

    // PULL / PUSH
    if (verb === "PULL" || verb === "PUSH") {
      if (obj === "MIRROR SHARD") {
        if (state.echo >= 2 && !state.mirrorMoved) {
          state.mirrorMoved = true;
          say("You angle the shard; the beam hits the door's glass seam.");
          completeRoom();
          return;
        }
        if (!state.mirrorMoved) {
          warn("The shard glints, but without the right light, it's only a shard.");
          return;
        }
        say("It's already angled just so.");
        return;
      }
      parserFail();
      return;
    }

    // OPEN
    if (verb === "OPEN") {
      if (obj === "DOOR") {
        if (!state.roomComplete) warn("It doesn't yield. Something is missing.");
        else say("The door unseals with a soft hiss. The room breathes.");
        return;
      }
      parserFail();
      return;
    }

    // USE
    if (verb === "USE") {
      if (obj === "ECHO LENS" || obj === "LENS" || obj === "ECHO") {
        if (state.inventory["echo lens (amber)"]) {
          state.inventory["echo lens (amber)"] -= 1;
          say("Text glints: a hidden code 'GLASS7' etched near the hinge.");
        } else warn("You don't seem to have that.");
        return;
      }
      parserFail();
      return;
    }

    // FUSE
    if (verb === "FUSE") {
      if (state.shards.light >= 1 && state.shards.sound >= 1) {
        state.shards.light--;
        state.shards.sound--;
        state.inventory["echo lens (amber)"] =
          (state.inventory["echo lens (amber)"] || 0) + 1;
        say("You combine Light + Sound → Artifact: Echo Lens (Amber).");
      } else {
        warn("You lack the shards to fuse. (Need: 1 Light shard, 1 Sound shard)");
      }
      return;
    }

    // WAIT
    if (verb === "WAIT") {
      say("You wait. Dust sorts itself into fractions you can't hold.");
      return;
    }

    parserFail();
  }

  function parserFail() {
    state.fails++;
    state.fear = clamp(state.fear + 2, 0, 100);
    err(randomNudge());
    if (settings.audio) ping(280, 90, 0.02);
    updateMeters();
    if (settings.hints && settings.hintsChips) suggestChips();
  }

  function randomNudge() {
    const lines = [
      "The room listens to the wrong word and grows bored.",
      "Words matter. Try a verb like LOOK, LISTEN, LIGHT, PULL.",
      "Misdirection is a teacher. The shadow knows where the light should go.",
      "If you had a flame, what would you light first?",
    ];
    const s = lines[Math.floor(Math.random() * lines.length)];
    return Math.random() < state.curse / 100 ? s.replace(/[aeiou]/g, "·") : s;
  }

  function offerHint() {
    if (!(settings.hints && settings.hintsEvents)) return;
    setChips(["LIGHT CANDLE WITH MATCHBOOK"]);
  }

  function suggestChips() {
    if (!(settings.hints && settings.hintsChips)) return;
    if (!state.candleLit) setChips(["LOOK ROOM", "LISTEN", "LIGHT CANDLE WITH MATCHBOOK"]);
    else if (state.echo === 1) setChips(["LIGHT PRISM"]);
    else if (!state.mirrorMoved) setChips(["PULL MIRROR SHARD"]);
    else setChips(["FUSE", "USE ECHO LENS"]);
  }

  function completeRoom() {
    if (state.roomComplete) return;
    state.roomComplete = true;
    setEcho(3);
    state.fear = clamp(state.fear - 7, 0, 100);

    say(">>> ROOM COMPLETED — LOOT ACQUIRED", "important");
    showBanner("Echo resonance: prism awakened", "info", true);
    say("Door unseals; a compartment opens.", "echo3");
    say("Loot: Light Shard ×1, Sound Shard ×1; Lore snippet unlocked.");

    if (settings.audio) ping(520, settings.photosafe ? 100 : 150, 0.035);
    echoFlash();
    setTimeout(tubeMorph, 80);

    showBanner("Room completed — loot acquired", "info", true);
    sonarTrail();
    coolPings(2200);

    state.shards.light++;
    state.shards.sound++;
    updateMeters();
    setChips(["FUSE", "USE ECHO LENS"]);
  }

  function resetRoom() {
    setEcho(1);
    Object.assign(state, {
      fear: 46,
      resolve: 41,
      roll: 210,
      curse: 12,
      candleLit: false,
      mirrorMoved: false,
      roomComplete: false,
      shards: { light: 0, sound: 0 },
      attempts: 0,
      fails: 0,
      hintsOffered: 0,
      hintsTaken: 0,
      firstTwistTs: null,
      listened: false,
      inventory: { matchbook: 2, paperclip: 1, "old coin": 1, chalk: 1 },
    });
    worldPingBudget = 2;

    say("The geometry resets. The whisper returns to seven.", "system");
    updateMeters();
    setChips(["LOOK ROOM", "LISTEN"]);
    showBanner("Room reset", "warn");
    coolPings(1200);
  }

  function showHelp() {
    say(
      "VERBS: LOOK, INSPECT, OPEN, LISTEN, USE, PUSH, PULL, LIGHT, WAIT, INVENTORY, HELP, FUSE, RESET"
    );
  }

  function boot() {
    card(`\n      <div class="card-wrap">\n        <svg class=\"prism-glyph\" viewBox=\"0 0 64 64\" aria-hidden=\"true\">\n          <polygon points=\"32,4 60,54 4,54\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/>\n          <line x1=\"32\" y1=\"4\" x2=\"32\" y2=\"54\" stroke=\"currentColor\" stroke-width=\"2\" opacity=\".5\"/>\n        </svg>\n        <div class=\"card-title\">THE PRISM ROOM</div>\n        <div class=\"card-sub\">© 2025 HOOPLA HOORAH. ALL RIGHTS RESERVED.</div>\n      </div>\n    `, "card hero");
    say("TRANSMISSION RECEIVED — code: GLASS7 (cosmetic only)", "system");
    say(
      "You face a heavy iron door. Flaking red paint reveals a thin seam of glass.",
      "system"
    );
    say(
      "A crystal prism dangles from a thread and turns lazily. A dusty projector whispers every 7 seconds.",
      "system"
    );
    say(
      "HINT: Nothing moves the way you expect here — change light or perspective.",
      "system"
    );
    applyCRT();
    updateMeters();
    input.focus();
    setChips(["LOOK ROOM", "LISTEN"]);
  }

  // --- Settings modal ---
  btnSettings.addEventListener("click", () => {
    chkAudio.checked = settings.audio;
    chkFlash.checked = settings.flash;
    chkCRT.checked = settings.crt;
    chkTube.checked = settings.tube;
    chkPhotosafe.checked = settings.photosafe;

    chkHints.checked = settings.hints;
    chkNudges.checked = settings.hintsNudge;
    chkChips.checked = settings.hintsChips;
    chkEvents.checked = settings.hintsEvents;

    dlg.showModal();
  });

  dlg.addEventListener("close", () => {
    settings.audio = chkAudio.checked;
    settings.flash = chkFlash.checked;
    settings.crt = chkCRT.checked;
    settings.tube = chkTube.checked;
    settings.photosafe = chkPhotosafe.checked;

    settings.hints = chkHints.checked;
    settings.hintsNudge = chkNudges.checked;
    settings.hintsChips = chkChips.checked;
    settings.hintsEvents = chkEvents.checked;

    applyCRT();

    if (!(settings.hints && settings.hintsChips)) {
      chipsEl.innerHTML = "";
      hudSuggest.textContent = "—";
    }
  });

  btnReset.addEventListener("click", (e) => {
    e.preventDefault();
    dlg.close();
    resetRoom();
  });

  // --- init ---
  setEcho(1);
  updateMeters();
  updateStats();
  boot();
})();

  // Remove hero card on first user action
  (function(){
    const input = document.querySelector('#prompt input, #cmd, #input') || document.getElementById('input');
    if(input){
      input.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){ removeHeroCardOnce(); }
      }, { once:true });
    } else {
      window.addEventListener('click', removeHeroCardOnce, { once:true });
    }
  })();

  // Nudge WebAudio to resume on first user gesture (autoplay policies)
  (function(){
    const poke = ()=>{ try{ if (typeof ensureAudio==='function') ensureAudio(); }catch(e){} window.removeEventListener('click',poke); window.removeEventListener('keydown',poke); };
    window.addEventListener('click', poke, { once:true });
    window.addEventListener('keydown', poke, { once:true });
  })();
