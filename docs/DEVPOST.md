# DevPost Write-up

## Problem / Insight
Seasonal haunted-room installations are usually high-effort one-offs. Teams spend weeks tuning the ambiance only to end up with brittle scenes that cannot be reused or reliably replayed. Prism Room flips the script with a kernel-first approach: we design the underlying experience kernel once, then reskin it with thematic content packs. The result is a repeatable spooky slice with clear specs, steering handles, and measurable outcomes instead of vibe-only guesswork.

## Implementation
The demo centers on a guided state machine: **enter → ping → echo → complete**. Each transition is deterministic, seeded, and fully observable. We surface experience hooks such as the echo tail, jittering particles, and the “mission complete” toast so judges can see the kernel at work. Reliability work includes a debounced re-entry check, color-contrast guardrails, and an accessible toggle for reduced motion. Instrumentation feeds into a simple session log so we can prove the experience is working without needing a manual QA run.

## Kiro Usage
Kiro acts as the engineering trail guide. We maintain a spec-driven acceptance checklist, steering documentation for live-tuning audio/visual elements, and pre-baked testing notes for accessibility. The repo also shows off a Kiro-powered `onSave` demo hook that updates the demo kernel whenever new content is added, underscoring how fast teams can iterate when they anchor around a kernel.

## Value & Future
We are packaging Prism Room as a set of content packs. “Skeleton Crew” is the hero pack for the hackathon, but the same kernel supports winter or sci-fi variants with only content swaps. Long term, this becomes a spooky SaaS: B2B event teams rent the kernel, pick a vibe pack, and drop it into their venue. Judges can call out repeatability, instrumentation, and accessibility as proof points for Best Startup consideration.

## Media
We plan to capture:
- A short loop of the ping → echo animation.
- The completion toast with the accessibility toggle in view.
- A quick flythrough of the Kiro folders (spec, steering, testing).
- Optional: a behind-the-scenes shot of seeded runs showing deterministic replays.
