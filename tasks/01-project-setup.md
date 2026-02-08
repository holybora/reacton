# Task 1: Initialize Next.js Project with TypeScript and Tailwind CSS

## Context

The repository is completely empty — it contains only a `.gitkeep` file and a `.context/` directory. Everything must be created from scratch.

## Goal

Bootstrap a working Next.js application with TypeScript, Tailwind CSS, and ESLint. Replace the default boilerplate with a minimal placeholder. Set up environment variables for LLM API keys.

## Dependencies

None — this is the first task.

## Steps

### 1. Initialize the Next.js project

Run the following command from the project root (`/Users/admin/conductor/workspaces/reacton/islamabad`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

> **Note:** If the command asks whether to overwrite existing files, answer yes. The `.gitkeep` file can be safely overwritten/deleted.

### 2. Clean up the boilerplate

Delete the `.gitkeep` file if it still exists:

```bash
rm -f .gitkeep
```

### 3. Replace the default page

Modify `src/app/page.tsx` — replace all boilerplate content with:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-white">LLM Comparison Tool</h1>
      <p className="mt-4 text-lg text-gray-400">
        Compare responses from different LLMs side-by-side
      </p>
    </main>
  );
}
```

### 4. Update the layout metadata

Modify `src/app/layout.tsx` — update the metadata export:

```tsx
export const metadata: Metadata = {
  title: "LLM Compare",
  description: "Compare responses from different LLMs side-by-side",
};
```

### 5. Simplify global styles

Modify `src/app/globals.css` — replace all content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0a0a;
  color: #ededed;
  font-family: system-ui, -apple-system, sans-serif;
}
```

### 6. Create environment files

Create `.env.local` with placeholder API keys:

```
# LLM API Keys — fill in your actual keys to enable each provider
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

Create `.env.example` with the same structure but no values (this file gets committed):

```
# LLM API Keys — fill in your actual keys to enable each provider
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

### 7. Verify .gitignore

Open `.gitignore` and confirm it contains `.env*.local`. The `create-next-app` scaffold should already include this. If missing, add it.

## Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Created by create-next-app |
| `tsconfig.json` | Created by create-next-app |
| `next.config.ts` | Created by create-next-app |
| `tailwind.config.ts` | Created by create-next-app |
| `postcss.config.mjs` | Created by create-next-app |
| `.eslintrc.json` | Created by create-next-app |
| `src/app/layout.tsx` | Modified — updated metadata |
| `src/app/page.tsx` | Modified — replaced boilerplate |
| `src/app/globals.css` | Modified — simplified to dark theme |
| `.env.local` | Created — API key placeholders |
| `.env.example` | Created — committed key template |
| `.gitkeep` | Deleted |

## Acceptance Criteria

- [ ] `npm run dev` starts the dev server without errors on `localhost:3000`
- [ ] `npm run build` completes successfully with no TypeScript or lint errors
- [ ] Visiting `localhost:3000` shows "LLM Comparison Tool" heading on a dark background
- [ ] The page subtitle reads "Compare responses from different LLMs side-by-side"
- [ ] `.env.local` exists with `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` variables
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] `.env.example` exists and can be committed
- [ ] The `src/` directory follows Next.js App Router conventions (`src/app/layout.tsx`, `src/app/page.tsx`)
- [ ] Tailwind CSS works — temporarily add `text-blue-500` to the heading and verify it renders blue, then remove it
