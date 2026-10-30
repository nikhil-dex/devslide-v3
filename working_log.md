# Working Log — AIRDeck / devslide-v3

> Purpose: preserve the project's current state, decisions, and next actions so work can resume without reconstructing the previous conversation.

**Repository:** [nikhil-dex/devslide-v3](https://github.com/nikhil-dex/devslide-v3)  
**Primary branch:** `main`  
**Product name in the app/docs:** AIRDeck (branding is not finalized)  
**Last updated:** 2026-10-30

---

## Current checkpoint

<badge>Planning / requirements clarification</badge>

**Current focus: Animation Engine, including GSAP support.**

We have clarified what the future Animation Engine should do and recorded it in the README roadmap. This is a requirements/planning checkpoint, not an implementation checkpoint: no Animation Engine or GSAP feature has been implemented as part of this work yet.

The latest repository change before this log was the README roadmap update:
- Commit: `3fb949c6b7001fc1dab9198f3d873517207cee16`
- Message: `docs: add GSAP support to animation roadmap`

## Animation Engine — agreed direction

The planned system is for animated HTML presentations and should include both approachable built-in animation controls and advanced GSAP capabilities.

### Expected capabilities

- Built-in element entrance, exit, and emphasis effects.
- Animation sequencing, timing, and staggered effects.
- Slide transitions.
- GSAP support for custom timelines, choreography, and precise motion control.
- Editor controls to configure and inspect animations.
- Ability to create and edit custom GSAP timelines.
- In-editor playback/preview so users can inspect motion in the context of the slide.
- A clear separation between static component layout, animation definitions, and runtime behavior.
- Presentation data should be usable by both the editor preview and browser playback.

### Important compatibility note

HTML/PDF/PPTX export already exists. Do not assume browser animations or GSAP timelines can be translated into editable PowerPoint animations. Treat that as a separate compatibility/design problem.

## Existing product baseline

The README currently documents these as implemented capabilities:

- Gemini-based structured presentation generation and schema validation.
- Theme registry with 10 themes.
- Component registry with 10 reusable slide components.
- Compiler that generates standalone 1920 × 1080 HTML slides.
- Sandbox editor with slide preview and Monaco-based HTML/CSS editing.
- AI-assisted editing of individual slides.
- Presentation saving, renaming, deletion, and sharing.
- HTML, PDF, and PPTX export.
- Google/GitHub authentication, MongoDB persistence, credits, and BYOK support.

The Sandbox editor exists inside the main application today. It is not yet a separately maintained/deployed repository.

## Roadmap decisions captured so far

1. **Sandbox Separation** — extract the existing editor and preview/runtime into a separate repository with its own deployment lifecycle, integrated with the main app through a defined interface.
2. **Animation Engine** — add built-in animation features and advanced GSAP timeline support as described above.
3. **Publish Platform** — build a public presentation community inspired by CodePen: public pages, profiles/portfolios, discovery, embeds, and potentially remix/duplicate.
4. **Collaboration** — explore invitations/permissions, collaborative editing, live presence, comments, and version history, taking inspiration from GitHub, Figma, and Canva.
5. **Marketplace** — still exploratory. Possible assets include themes, components, templates, and animation packs; scope and business model are undecided.

## Suggested next steps

These are proposed next actions, not completed work:

1. Inspect the current Sandbox editor, slide preview/runtime, compiler, deck schema, and export pipeline before designing the animation architecture.
2. Decide how animation data is represented in the deck schema (for example, target element, trigger, effect/timeline, duration, delay, easing, and sequencing).
3. Define the boundary between built-in effects and custom GSAP timelines, including how custom code is stored, validated, and executed safely.
4. Design the editor UX for selecting elements, configuring effects, editing timelines, and previewing/replaying animations.
5. Define how animations behave during presentation playback, navigation, and export.
6. Implement a small end-to-end vertical slice before expanding the effect library.

**Do not start by assuming a particular file structure or implementation.** First inspect the current codebase and identify the actual rendering and editing entry points.

## Other project context

- The project was migrated from `nikhil-dex/airDeck-v2` into `nikhil-dex/devslide-v3`.
- The repository is named `devslide-v3`, while the README retains AIRDeck as the current in-app/project name pending a branding decision.
- README commits already made:
  - `347ddd340dca60bc0e8280d0eaeb7b49ba8a05b3` — document current product and repository structure.
  - `fba76796e43cc3e93c08ed994375c73941b5d40c` — clarify implemented vs planned roadmap items.
  - `3fb949c6b7001fc1dab9198f3d873517207cee16` — add GSAP to the Animation Engine roadmap.

## Session handoff template

At the end of each meaningful work session, update this file with:

- **Date and branch**
- **Current feature/task**
- **What changed** (files, behavior, commits)
- **What was tested** (and the actual result; never mark tests as run unless they were run)
- **Current blockers or open decisions**
- **Exact next step** to resume work

Keep the checkpoint factual. Distinguish implemented, in-progress, planned, and merely proposed work. Add new session entries below rather than silently erasing useful history.

---

## Session history

### 2026-10-30 — Animation Engine requirements checkpoint

- Clarified that the planned editor should support GSAP animation, in addition to built-in animation controls.
- Added GSAP timelines, choreography, staggered effects, editor configuration, and preview expectations to the README roadmap.
- Clarified that GSAP-to-editable-PowerPoint animation conversion is not guaranteed.
- No application code or animation implementation was changed in this session.
- **Resume from:** inspect the current Sandbox/editor and HTML rendering architecture, then turn the animation requirements into a concrete technical design.
