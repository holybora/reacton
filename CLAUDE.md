# Claude Code Project Configuration

## Project Overview

LLM Comparison Tool — a Next.js web app for comparing responses from different LLMs (OpenAI, Anthropic, Google) side-by-side.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint with next config
- **Package Manager:** npm

## Project Structure

```
src/
  app/
    layout.tsx    — root layout with metadata
    page.tsx      — home page
    globals.css   — global styles (Tailwind + dark theme)
tasks/            — task files for incremental feature development
```

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`

`.env.local` is gitignored — never commit real API keys.

## MCP Servers

This project uses [Figma Developer MCP](https://www.npmjs.com/package/figma-developer-mcp) to give Claude Code access to Figma design files. Config is in `.mcp.json`.

### Setup: Figma Personal Access Token

1. Go to Figma account settings: https://www.figma.com/settings
2. Scroll to "Personal access tokens" and generate a new token
3. Export it in your shell profile (`~/.zshrc` or `~/.bashrc`):

   ```bash
   export FIGMA_API_KEY="your-figma-personal-access-token"
   ```

4. Restart your terminal or `source ~/.zshrc`

Never commit your Figma API key. The `.mcp.json` references the env var only.

### Verifying

Run `/mcp` in Claude Code — `figma-developer-mcp` should show as connected.
