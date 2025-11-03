# The Prism Room – Kitoween Kernel

A tiny, spooky kernel slice for **The Prism Room (inspired by Welles)** designed for the Kiroween hackathon. It demonstrates a peek into our loop: enter → ping → echo → complete → reset, plus structured Kiro workflow.

## Quickstart
- Open `index.html` in a browser **or** run a static server (e.g., `npx serve .`).
- Controls: Space/Click = Ping • `i` = Info • `m` = Mute • `h` = High-contrast • `r` = Reduced motion • Esc/Enter/Click = Dismiss toast.

## What This Shows
- Reliable **Room Complete** toast (sticky + dismissable)
- **Ping echo** tail (~2–3s), with reduced-motion fallback
- **Description text** block with `i` toggle
- Timer stability and seeded runs (`?seed=42`)
- Accessibility: keyboard-only path, high-contrast & reduced motion

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
