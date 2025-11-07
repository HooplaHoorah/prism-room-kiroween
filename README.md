The Prism Room — Kiroween Kernel (v1.3.9)

A tiny, spooky kernel slice for The Prism Room (inspired by H. G. Welles’ “The Red Room”). A quick peek into the loop: enter → ping → echo → complete → reset. No splash screen, no music—just the core feel and readability we’re shipping for Kiroween.

Play: open index.html in a modern desktop browser, or run npx serve . and open the local URL.
Tip: allow page audio; press Space (or click) to ping.

HUD & Hotkeys

Top HUD shows Echo • Fear/Resolve • Roll timer • Curse • quick actions.

Alt+I Inventory • Alt+H Help • Alt+R Reset • Last event • Settings (modal)

Settings (modal)

Audio pings, Visual flash on Echo, CRT skin, Tube power-on morph

Photosensitive mode: reduces/turns off motion & flashes

Hints: Enable hints, nudge on parser fail, suggest next action chips, auto-hint after major events

Reset Room button

Parser quick tries

LOOK ROOM • LISTEN • LIGHT PRISM • PULL MIRROR SHARD • FUSE • USE ECHO LENS

What this demo shows

Sticky Room Complete toast (Esc/Enter/click to dismiss)

Ping echo tail (~2–3s) with photosensitive fallback

Readable HUD, INVENTORY: label in caps, autoscroll & event banner polish

Seeded runs for reproducibility: visit index.html?seed=42

Repo layout
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
LICENSE

Notes

The older slide-out settings UI lives on a secondary branch; it is not part of main.

Release: v1.3.9

© 2025 Hoopla Hoorah, LLC. All rights reserved.
