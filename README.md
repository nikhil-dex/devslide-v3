# 🎨 AIRDeck

> AI-native presentation engine for generating beautiful, interactive HTML presentations.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)]()
[![React](https://img.shields.io/badge/React-19-61DAFB)]()
[![License](https://img.shields.io/badge/License-Private-red)]()
[![Status](https://img.shields.io/badge/Status-Active-success)]()

---

## ✨ Overview

AIRDeck is an AI-powered presentation platform that transforms natural language into polished, interactive presentations.

Instead of manually arranging slides, users describe their ideas in plain English. AIRDeck generates a structured presentation, compiles it into responsive HTML, and applies professionally designed themes and reusable components.

Unlike traditional slide editors, AIRDeck is built around a presentation engine rather than a canvas editor.

---

## 🚀 Features

- 🤖 AI-powered presentation generation
- 🎨 Intelligent theme selection
- 🧩 Component-driven slide system
- 🌈 Multiple professionally designed themes
- 📑 Interactive HTML presentations
- ⚡ Compiler-based rendering pipeline
- 🛡 Schema validation
- 📱 Responsive presentations
- 🎭 Modern animation system
- 📚 Developer-friendly architecture

---

## 🏗 Architecture

```text
                Prompt
                   │
                   ▼
           AI Presentation Engine
                   │
                   ▼
             Deck JSON Schema
                   │
                   ▼
           Validation Pipeline
                   │
                   ▼
          AIRDeck Compiler
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Theme Engine     Component Engine
          │                 │
          └────────┬────────┘
                   ▼
           Interactive HTML
```

---

# 📂 Project Structure

```text
app/
components/
deck/
 ├── compile.js
 ├── schema.js
 ├── themes/
 ├── components/
 ├── animations/
 └── utils/

public/
```

---

# 🎨 Theme System

AIRDeck ships with professionally designed themes.

Current themes include:

- Linear
- Apple
- Aurora
- GitHub Dark
- Academic
- Dashboard Pro
- Cinema
- Notion
- Stripe
- Cyberpunk

Each theme includes:

- AI metadata
- Color system
- Typography
- Layout rules
- Motion tokens
- Component styling

---

# 🧩 Component System

Reusable slide components.

Examples:

- Hero
- Timeline
- Dashboard
- Comparison
- Code
- Metrics
- Pricing
- Steps
- Features
- Quote

Each component includes:

- Validation schema
- AI metadata
- Documentation
- Example payload
- Live preview

---

# ⚙ Compiler

AIRDeck compiles structured presentation data into responsive HTML.

Pipeline:

Deck JSON

↓

Validation

↓

Theme Resolution

↓

Component Rendering

↓

Compiled HTML

---

# 🤖 AI Generation

AIRDeck uses metadata-driven prompting.

The AI does not generate HTML directly.

Instead it generates structured presentation data which is validated before compilation.

This approach makes generation:

- Consistent
- Predictable
- Maintainable
- Extensible

---

# 📚 Documentation

Built-in documentation includes:

- Getting Started
- Themes
- Components
- Prompt Guide
- Examples
- Playground
- Reference

---

# 🛣 Roadmap

Current

- ✅ Theme Engine
- ✅ Component Engine
- ✅ Compiler
- ✅ Documentation
- ✅ Website

Next

- Sandbox
- Animation Engine
- PPT Export
- Publish Platform
- Marketplace
- Collaboration

---

# 🛠 Tech Stack

Frontend

- Next.js
- React
- Tailwind CSS
- Framer Motion

Backend

- Next.js API Routes

AI

- Google Gemini

Presentation Engine

- Custom Compiler
- Custom Schema
- Theme Engine
- Component Engine

---

# Development

Clone

```bash
git clone https://github.com/nikhil-dex/airDeck-v2.git
```

Install

```bash
npm install
```

Run

```bash
npm run dev
```

---

# Philosophy

AIRDeck is built around one simple idea.

> Great presentations should be described, not designed.

AI should handle repetitive work while people focus on communicating ideas.

---

# Contributing

AIRDeck is currently under active development.

Public contributions are planned for the future.

---

# License

Currently Private.

An open-core architecture is planned for future releases.

---

Built with ❤️ using Next.js and AI.