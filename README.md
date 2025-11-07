# The Prism Room – Kiroween Kernel

A tiny, spooky kernel slice for **The Prism Room (inspired by H.G. Welles' _The Red Room_)** designed for the Kiroween hackathon. It demonstrates a peek into our loop: enter → ping → echo → complete → reset, plus structured Kiro workflow.

## Quickstart

- Open `index.html` in a browser **or** run a static server (e.g., `npx serve .`).

## Controls

- `Space` / Click — Ping the room  
- `i` — Toggle info text  
- `m` — Toggle mute  
- `h` — High-contrast mode (adds a body class for accessible contrast)  
- `r` — Reduced-motion mode (swaps ripple echo for soft pulse)  
- `Esc` / `Enter` / toast click — Dismiss "Room Complete" toast (auto hides after ~2.8s)

## Accessibility & Replay Notes

- High-contrast mode adjusts the canvas, toast, and overlays to maintain accessible contrast.
- Reduced-motion mode replaces the ripple trail with a gentle pulse while keeping the ~3s lifetime.
- Append `?seed=<int>` (for example, `?seed=42`) to the URL for deterministic room echoes.
- The in-room timer pauses only while the completion toast is visible and resumes once dismissed.

## What This Shows

- Reliable "Room Complete" toast (sticky and dismissable)
- Ping echo tail (~2–3s), with reduced-motion fallback
- Description info block with `i` toggle
- Timer stability and seeded runs (`?seed=42`)
- Keyboard-only accessibility path
- Small DEV overlay logging recent state transitions on error


## Kiro Usage
- `/.kiro/spec/Spec.md` – user story + ACs
- `/.kiro/steering/` – tech, accessibility, testing standards
- `/.kiro/hooks/on-save.md` – demo hook idea for lint + 🎃 tag

## Repo Layout
```
index.html
styles.css
script.js
media/
docs/DEVPOST.md
docs/VIDEO_SCRIPT.md
.kiro/spec/Spec.md
.kiro/steering/tech.md
.kiro/steering/accessibility.md
.kiro/steering/testing-standards.md
.kiro/hooks/on-save.md


README.md
LICENSE
```

## License
MIT © 2025-11-03

The Prism Room. Trademark 2025. Hoopla Hoorah, LLC. All Rights Reserved.
