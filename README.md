# DeckFlow

Turn your financial data into boardroom-ready slide decks in seconds.

DeckFlow reads spreadsheets and financial reports, extracts the story in the numbers, and builds a polished PowerPoint deck you can present the same day. Drop in a file, set the look, and leave with slides that are ready for a board meeting.

## Features

- **AI-powered analysis** — Claude reads your data, surfaces the metrics that matter, and drafts a slide outline with charts, tables, and narrative.
- **Multiple file formats** — Upload Excel (`.xlsx`, `.xls`), CSV, or PDF. DeckFlow parses each format and normalizes it into a single structure for analysis.
- **Three professional themes** — Choose Corporate, Modern, or Light. Each theme is built for executive presentations, with typography and color tuned for the boardroom.
- **Custom branding** — Set a company name, accent color, and logo so every deck looks like it came from your team.
- **Drag-and-drop preview** — Reorder slides before you export, then download a real `.pptx` that opens in PowerPoint and Google Slides.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Slide generation | PptxGenJS |
| Analysis | Claude API |
| File parsing | SheetJS, pdf-parse |

## How It Works

1. **Upload** — Drop in an Excel, CSV, or PDF file. DeckFlow parses the file and keeps the session on your machine until you generate.
2. **Customize** — Pick a theme, accent color, company name, and logo. Add a short note about what the presentation is for.
3. **Generate** — Claude analyzes the data, identifies key metrics and trends, and builds a slide outline.
4. **Preview & Download** — Review the deck, drag slides into the order you want, and download a `.pptx` ready to present.

## Getting Started

**Prerequisites:** Node.js 20+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
git clone https://github.com/OmkarBuildsProj/finance-deck-builder.git
cd finance-deck-builder
npm install
```

Create a `.env.local` file in the project root and add your API key:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Live Demo

A hosted demo will be available here once the app is deployed:

**[Live Demo](https://your-deckflow-demo.vercel.app)** — replace this link with your Vercel URL.
