# ROOM TEMPLATE — Building on the Kiroween Kernel

This repo is a Kiro-powered **template**. Use this checklist when you want to build a
new room on top of *The Prism Room — Kiroween Kernel* without rewriting the core loop.

---

## 1. Spin up your own repo

1. On GitHub, click **Use this template** on the repo page.
2. Name your new repo after your room, e.g. `haunted-library-room`.
3. Clone your new repo locally.

---

## 2. Update the spec first (Kiro layer)

Open `.kiro/spec/Spec.md` and update:

- **User Story** – 1–3 sentences describing your new room.
- **Acceptance Criteria** – bullets for “done”, including:
  - what the HUD needs to show,
  - which hotkeys must work,
  - any special a11y rules for this room.

Keep the structure; just replace Prism Room–specific text.

If your room changes how the kernel works (new states, flags, or UI), also review:

- `.kiro/steering/tech.md` – engine, state machine, feature flags, seed param.
- `.kiro/steering/accessibility.md` – keyboard-only path, `aria-live` toasts,
  reduced-motion & high-contrast behavior.
- `.kiro/steering/testing-standards.md` – linting and manual test expectations.

---

## 3. Change only the room content (code layer)

In `script.js`:

- Swap out the **narrative strings**, hints, and loot descriptions with your own.
- Keep the **state machine, HUD wiring, and event banner plumbing** intact unless you
  intentionally extend the kernel itself.
- Leave the ECHO bars, suggestion row, and accessibility hooks in place.

Think of this as a **reskin**: new story, same kernel.

You can optionally add comments like:

```js
// === ROOM CONTENT START (safe to edit) ===
// (room text, hints, loot, etc.)
// === ROOM CONTENT END ===
