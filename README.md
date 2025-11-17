# The Prism Room — Kiroween Kernel (v1.3.9)

[![Live Demo](https://img.shields.io/badge/live%20demo-GitHub%20Pages-blue)](https://hooplahoorah.github.io/prism-room-kiroween/)
[![Version](https://img.shields.io/badge/version-v1.3.9-brightgreen)](https://github.com/HooplaHoorah/prism-room-kiroween/releases/tag/v1.3.9)
[![License](https://img.shields.io/github/license/HooplaHoorah/prism-room-kiroween)](./LICENSE)

A tiny, spooky kernel slice for **The Prism Room** (inspired by H. G. Welles’ “The Red Room”). It’s a quick peek into our loop: **enter → ping → echo → complete → reset**. No title splash, no background music—intentionally trimmed for clarity and speed for Kiroween.

**Category:** Skeleton Crew • **Release:** v1.3.9

**Changelog:** see [CHANGELOG.md](./CHANGELOG.md).

---

## Play it
- Open `index.html` in a modern desktop browser, or run a static server (`npx serve .`) and open the local URL.  
- Allow page audio. Press **Space** (or click) to **Ping**.

> Tip: seeded runs for reproducibility — append `?seed=<int>` (e.g., `index.html?seed=42`).

➡️ Want to build your own room? Start with [ROOM_TEMPLATE.md](./docs/ROOM_TEMPLATE.md) and the Kiro spec in `.kiro/spec/Spec.md`.

---

## HUD & Hotkeys
Top HUD shows **Echo • Fear/Resolve • Roll timer • Curse • quick actions**.

- **Alt+I** Inventory • **Alt+H** Help • **Alt+R** Reset  
- **Last** button replays the most recent event  
- **Settings** opens the modal

---

## Settings (modal)
- **Photosensitive Mode:** reduces/turns off motion and flashes  
- **Hints:** enable/disable nudges, suggestion chips, and auto-hints after major events  
- **Audio:** toggle pings on/off  
- Visual treatments (build-dependent): **CRT skin**, **tube power-on morph** (disabled by Photosensitive Mode)

Accessibility:
- **Focus-trapped** modal; **Esc** closes
- **ARIA live region** announces events
- Keyboard-only path is supported end-to-end

---

## Parser quick tries
```
LOOK ROOM • LISTEN • LIGHT PRISM • PULL MIRROR SHARD • FUSE • USE ECHO LENS
```

---

## What this demo shows
- **Sticky “Room Completed — Loot Acquired”** banner (Esc/Enter/click to dismiss)  
- **Ping echo tail** (~2–3s) with photosensitive fallback  
- Readable HUD, **INVENTORY:** label in caps, autoscroll & event-banner polish  
- **Replay Last** event button  
- **Seeded runs** via `?seed=42`

---

## Repo layout
```
index.html
style.css
script.js
assets/                # (if present) images/fonts/audio
docs/DEVPOST.md
docs/VIDEO_SCRIPT.md
.kiro/spec/Spec.md
.kiro/steering/tech.md
.kiro/steering/accessibility.md
.kiro/steering/testing-standards.md
.kiro/hooks/on-save.md
LICENSE
```

**Note:** The older slide-out settings UI lives on a secondary branch; it is **not** part of `main` (v1.3.9 uses a **modal**).

---

## Kiro usage (specs • steering • hooks)
We keep the kernel small and portable with:
- **Specs** to define behavior before code  
- **Steering** docs to enforce UI/accessibility/testing standards  
- **Hooks** to automate routine updates while iterating

This is a **Skeleton Crew** starter meant to be cloned into future rooms without rewriting the core loop.

---

## Contributing / Dev
- Static site — no build step required  
- Keep asset paths **relative** for GitHub Pages  
- To bust caches on deploy, append `?v=1.3.9` to CSS/JS in `index.html`

---

## License & Credits
- See [LICENSE](./LICENSE).  
- **®© 2025 Hoopla Hoorah, LLC. Created by Richard A. Morgan.**
