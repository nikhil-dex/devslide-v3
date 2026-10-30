# AIRDeck — AI Presentation Builder

> Turn a prompt into a structured presentation, edit it, and export it as HTML, PDF, or PowerPoint.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Private-red)]()

AIRDeck is an AI-powered presentation application. It converts a natural-language brief into validated deck data, compiles that data into standalone HTML slides, and provides tools to preview, edit, save, share, and export presentations.

The repository is currently named `devslide-v3`. Product branding is still being evaluated, so this README retains AIRDeck as the in-app/project name rather than treating DevSlide as a finalized brand.

---

## What it does

1. Describe the presentation you want in natural language.
2. Generate a structured presentation using Google Gemini.
3. Validate the generated deck against the application's schema.
4. Compile the deck into standalone HTML slides using the theme and component registries.
5. Preview and edit slides in the Sandbox, including AI-assisted editing of an individual slide.
6. Save presentations, share them, and export them.

## Features

- **AI presentation generation** — Gemini turns a prompt into structured deck data rather than generating an unvalidated HTML document.
- **Structured deck format** — a versioned JSON schema validates deck data before compilation.
- **Theme registry** — ten built-in themes: Linear, Apple, Aurora, GitHub Dark, Academic, Dashboard Pro, Cyberpunk, Cinema, Notion, and Stripe.
- **Reusable slide components** — ten registered components: Hero, Comparison, Timeline, Dashboard, Quote, Code, Steps, Table, Callout, and Image.
- **HTML compiler** — compiles validated deck data into standalone 1920 × 1080 HTML slides.
- **Sandbox editor** — preview slides, edit their HTML/CSS with Monaco, and manage the presentation.
- **AI slide editing** — request a change to an individual slide using natural language.
- **Presentation library** — save, view, rename, and delete your presentations.
- **Sharing** — create public share links and share presentations with registered users.
- **Exports** — download presentations as HTML, PDF, or PPTX.
- **Authentication** — sign in with Google or GitHub through NextAuth.
- **Credits and BYOK** — credit-based AI usage with Bring Your Own Gemini API Key support. A BYOK key is kept in the browser and sent with the request; it is not stored by the application server.

## How the presentation engine works

```text
Natural-language prompt
        |
        v
Gemini generation
        |
        v
Structured Deck JSON
        |
        v
Schema validation
        |
        v
Theme + component resolution
        |
        v
AIRDeck compiler
        |
        v
Standalone HTML slides
        |
        +----> Sandbox preview and editing
        |
        +----> Save and share
        |
        +----> HTML / PDF / PPTX export
```

The generation pipeline and the editing pipeline are intentionally distinct today: initial generation produces structured deck data and compiles it to HTML, while the Sandbox and per-slide editing workflow operate on the resulting HTML.

## Tech stack

| Area | Technologies |
| --- | --- |
| Application | Next.js 16, React 19 |
| Styling and UI | Tailwind CSS 4, Framer Motion, Lucide React |
| Code editor | Monaco Editor |
| AI | Google Gemini |
| Authentication | NextAuth, Google OAuth, GitHub OAuth |
| Database | MongoDB, Mongoose |
| Presentation engine | Custom deck schema, theme registry, component registry, HTML compiler |
| Export | Playwright / Chromium, PptxGenJS |
| Export storage | Vercel Blob |

## Repository layout

The project is a Next.js application. Important areas include:

```text
app/
  api/
    auth/                 # NextAuth handlers
    generate-ppt/         # AI deck generation
    edit-slide/           # AI-assisted slide editing
    save-ppt/             # Save presentation
    ppt/                  # Presentation read/update/delete and sharing
    export-pdf/            # PDF export
    export-pptx/           # PowerPoint export
  sandbox/                 # Presentation editor and preview
  presentations/           # Saved presentations
  present/                 # Shared presentation view
  exportDetails/           # Save, share, and export flow

components/                # Application UI and documentation
deck/
  schema.js                # Deck data validation
  compile.js               # Structured deck -> standalone HTML
  components/              # Registered slide components
  themes/                  # Registered visual themes

lib/                       # Database, AI, credits, BYOK, export helpers
models/                    # Mongoose models
tests/                     # Schema, compiler, API, and export tests
public/                    # Static assets
```

## Getting started

### Requirements

- Node.js compatible with the installed Next.js 16 toolchain
- npm
- MongoDB
- Google and/or GitHub OAuth credentials for sign-in
- A Gemini API key for server-managed AI generation, unless users supply their own key through BYOK

### 1. Clone the repository

```bash
git clone https://github.com/nikhil-dex/devslide-v3.git
cd devslide-v3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root. Configure the values required by the integrations you intend to run:

```dotenv
# Database
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Gemini (optional when users provide their own key)
GEMINI_API_KEY=
GEMINI_MODEL=

# Export artifact storage (required for hosted export downloads)
EXPORTS_BLOB_READ_WRITE_TOKEN=
EXPORTS_STORE_ID=
```

For Vercel deployments, configure the Chromium runtime settings required by the export renderer, including `CHROMIUM_PACK_URL` where applicable. Never commit real secrets or API keys.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test:deck` | Run deck schema and compiler tests |
| `npm run test:api` | Run API ownership tests |
| `npm run test:pdf` | Run PDF export tests |
| `npm run test:pdf:route` | Run PDF export route tests |
| `npm run test:pptx` | Run PowerPoint export tests |
| `npm run test:pptx:route` | Run PowerPoint export route tests |
| `npm run test:download` | Run download helper tests |
| `npm run test:storage` | Run export storage tests |

Some tests require environment variables or local services. Configure those dependencies before running the relevant suite.

## Deck format and extension points

The deck schema, theme registry, component registry, and compiler are the core extension points:

- Add or update deck validation in `deck/schema.js`.
- Add a slide component under `deck/components/` and register it in `deck/components/index.js`.
- Add a theme under `deck/themes/` and register it in `deck/themes/index.js`.
- Keep AI generation instructions aligned with the registered themes, components, and schema.
- Run the deck tests after changing schema or compiler behavior.

The compiler is designed to turn validated, serializable deck data into self-contained HTML. Keep rendering deterministic and avoid relying on browser state or server-side application state inside compiled slides.

## Current project status

Implemented application capabilities include AI generation, schema validation, the theme and component registries, HTML compilation, the Sandbox editing workflow, saved presentations, sharing, and HTML/PDF/PPTX export.

The README describes implemented repository functionality; it does not imply that a production deployment, external OAuth setup, export storage, or every environment-specific configuration is already provisioned.

## Roadmap

The roadmap separates capabilities that already exist from the larger platform and architecture work still to be built.

### Implemented

- Theme Engine
- Component Engine
- Presentation Compiler
- Sandbox Editor (currently part of the main application)
- HTML, PDF, and PPTX export
- Presentation saving and sharing
- Website and project documentation

### Planned

1. **Sandbox Separation** — extract the existing code editor and preview/runtime into a separate repository with its own deployment lifecycle. Integrate it with the main application through a defined interface so the editor can be developed and released independently.
2. **Animation Engine** — introduce a dedicated animation system for HTML slides. It should support built-in element entrance, exit and emphasis effects, sequencing and timing, and slide transitions. The editor should also support **GSAP** for advanced custom animation timelines, choreography, staggered effects, and precise control over motion. Provide editor controls to configure, inspect, and preview animations, alongside the ability to create and edit custom GSAP timelines. Keep animation definitions and runtime behavior separate from static component layout so presentation data can drive editor previews and browser playback.
3. **Publish Platform** — evolve beyond private or direct share links into a public presentation community, similar in spirit to CodePen. Users should be able to publish presentations to public pages, build profiles or portfolios, discover work, embed presentations, and potentially remix or duplicate public decks.
4. **Collaboration** — enable people to work on presentations together, taking inspiration from GitHub, Figma, and Canva. Potential capabilities include invitations and permissions, collaborative editing, live presence, comments, and version history.
5. **Marketplace (scope to be defined)** — explore a marketplace for reusable presentation assets such as themes, components, templates, and animation packs. The exact scope, including whether complete presentations can be distributed or sold, is not decided yet.

### Roadmap notes

- PPTX export is an implemented capability, not an upcoming roadmap item. Support for translating browser-based animations, including GSAP timelines, into editable PowerPoint animations is a separate compatibility question and should not be assumed.
- Sandbox Separation refers to moving the existing editor/runtime into a separately maintained and deployed repository; it does not mean that the current application has no Sandbox editor.
- The Publish Platform is intended to be a public discovery and publishing experience, which is broader than the existing presentation-sharing functionality.
- Marketplace remains exploratory until its purpose and business model are defined.

## Security notes

- Keep `.env.local` and all credentials out of version control.
- Treat user-provided Gemini keys as secrets. The BYOK implementation stores the key in the user's browser and sends it as a request header.
- Validate and authorize presentation access on the server; do not rely on client-side visibility controls.
- Configure production OAuth callback URLs, database access, and Blob permissions for the deployed environment.

## License

This repository is currently private. No public open-source license has been declared.

---

Built with Next.js, Gemini, and a custom presentation compiler.
