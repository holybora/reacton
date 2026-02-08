# Task 5: Build Response Display Components with Loading States and Markdown

## Context

After Tasks 1-2, you have a Next.js project with TypeScript types and a model registry. The API route (Task 4) and prompt input (Task 3) are being built in parallel. This task builds the output/display side independently.

## Goal

Create the components that display LLM responses side-by-side after a comparison. Includes loading skeletons, error states, markdown rendering, and a copy-to-clipboard button. These components accept data via props and are purely presentational.

## Dependencies

- Task 1 (project setup)
- Task 2 (types in `src/lib/types.ts`, constants in `src/lib/constants.ts`)

## Steps

### 1. Install markdown rendering dependencies

```bash
npm install react-markdown remark-gfm
npm install -D @tailwindcss/typography
```

Then update `tailwind.config.ts` to add the typography plugin:

```typescript
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
export default config;
```

> **Note:** The exact Tailwind config format may vary based on what `create-next-app` generated. Merge the `typography` plugin into the existing config rather than replacing it entirely. Check the existing file first.

### 2. Create `src/components/LoadingSkeleton.tsx`

An animated placeholder that simulates text being loaded:

**Requirements:**
- Render 4-5 horizontal bars of varying widths (e.g., 100%, 85%, 92%, 70%, 60%)
- Each bar is a rounded rectangle with background `bg-gray-700`
- Apply a pulsing animation using Tailwind's `animate-pulse` class
- The bars should have small gaps between them (like lines of text)
- Height of each bar: `h-4` (16px)
- The component should feel like a realistic text placeholder

### 3. Create `src/components/CopyButton.tsx`

A button that copies text to the clipboard with visual feedback:

```tsx
"use client";

interface CopyButtonProps {
  text: string;
}
```

**Requirements:**
- Default state: Shows a copy icon (use a simple SVG clipboard icon, or the text "Copy")
- On click: calls `navigator.clipboard.writeText(text)`, then transitions to "Copied!" state
- The "Copied!" state shows for 2 seconds, then reverts back to the default state (use `setTimeout`)
- Style: small, subtle button (ghost/outline style), fits in a card footer
- Handle the case where `navigator.clipboard` is not available (show "Copy" text that falls back gracefully)

### 4. Create `src/components/MarkdownRenderer.tsx`

A component that renders markdown content as styled HTML:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}
```

**Requirements:**
- Use `react-markdown` with the `remark-gfm` plugin for GitHub Flavored Markdown (tables, strikethrough, task lists)
- Wrap the output in a `<div>` with Tailwind typography classes: `prose prose-invert prose-sm max-w-none`
  - `prose`: applies typography styles
  - `prose-invert`: adapts for dark backgrounds
  - `prose-sm`: slightly smaller text for compact display
  - `max-w-none`: allows content to fill the container
- Style code blocks with additional dark background (`prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700`)
- Inline code should have a subtle background (`prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded`)

### 5. Create `src/components/ResponseCard.tsx`

Individual card displaying one model's response:

```tsx
"use client";

import { ModelResponse } from "@/lib/types";
import { getModelById } from "@/lib/models";
import { PROVIDER_COLORS } from "@/lib/constants";
import LoadingSkeleton from "./LoadingSkeleton";
import MarkdownRenderer from "./MarkdownRenderer";
import CopyButton from "./CopyButton";

interface ResponseCardProps {
  response: ModelResponse;
}
```

**Requirements:**

#### Card Structure
- Rounded container with border (`border-gray-800`), dark background (`bg-gray-900/50`)
- Divided into header, body, and footer sections

#### Header
- Model name (look up from registry using `getModelById(response.modelId)`)
- Provider badge: small colored pill showing the provider name (use `PROVIDER_COLORS`)
- The header should have a bottom border separating it from the body

#### Body — Three States Based on `response.status`

**Loading (`status: "loading"`):**
- Render the `<LoadingSkeleton />` component
- The card should still show the header with the model name

**Error (`status: "error"`):**
- Red-tinted background area (`bg-red-900/20 border-red-800`)
- Show an error icon (simple "!" in a circle, or use an SVG)
- Display `response.error` text in `text-red-400`
- No footer needed for error state

**Success (`status: "success"`):**
- Render `<MarkdownRenderer content={response.content!} />`
- The content area should have a maximum height with scroll overflow (`max-h-96 overflow-y-auto`) to prevent very long responses from dominating the layout
- Show the footer with latency and copy button

#### Footer (success state only)
- Left side: latency display formatted as seconds (e.g., "1.2s" or "0.8s")
  - Format: `(response.latencyMs / 1000).toFixed(1) + "s"`
  - Style: small, muted text (`text-gray-500 text-xs`)
- Right side: `<CopyButton text={response.content!} />`

### 6. Create `src/components/ComparisonResults.tsx`

Container component that renders a grid of response cards:

```tsx
import { ComparisonResult } from "@/lib/types";
import ResponseCard from "./ResponseCard";

interface ComparisonResultsProps {
  result: ComparisonResult;
}
```

**Requirements:**
- At the top, show the original prompt as context in a styled quote block:
  - Gray background, left border accent, italic text
  - Truncate if longer than 200 characters with "..." suffix
- Below the prompt, render a responsive CSS grid of `ResponseCard` components:
  - 1 column on mobile (`grid-cols-1`)
  - 2 columns on medium screens (`md:grid-cols-2`)
  - 3 columns on large screens (`lg:grid-cols-3`)
  - Gap between cards: `gap-4`
- Map over `result.responses` and render one `<ResponseCard>` per response
- Add `key={response.modelId}` to each card

## Files Created/Modified

| File | Action |
|------|--------|
| `tailwind.config.ts` | Modified — added `@tailwindcss/typography` plugin |
| `src/components/LoadingSkeleton.tsx` | Created — animated text placeholder |
| `src/components/CopyButton.tsx` | Created — clipboard copy with feedback |
| `src/components/MarkdownRenderer.tsx` | Created — markdown to styled HTML |
| `src/components/ResponseCard.tsx` | Created — individual model response card |
| `src/components/ComparisonResults.tsx` | Created — responsive grid of response cards |

## Acceptance Criteria

- [ ] `npm run build` succeeds with no errors
- [ ] `react-markdown`, `remark-gfm`, and `@tailwindcss/typography` are installed and configured
- [ ] `LoadingSkeleton` renders 4-5 pulsing placeholder bars of varying widths
- [ ] `CopyButton` copies text to clipboard and shows "Copied!" for 2 seconds
- [ ] `MarkdownRenderer` correctly renders: headers, bold text, code blocks (inline and fenced), bullet lists, numbered lists, tables
- [ ] `ResponseCard` in loading state shows the skeleton animation with the model name in the header
- [ ] `ResponseCard` in error state shows a red-themed error message
- [ ] `ResponseCard` in success state shows rendered markdown with latency and copy button
- [ ] `ComparisonResults` renders a responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] The original prompt is shown as a quote above the response grid
- [ ] All components use the dark theme consistently (dark backgrounds, light text, muted borders)
- [ ] Long responses are scrollable within the card (max height with overflow)

### Visual Verification

To verify these components work before Task 6 wires them up, you can temporarily add test data to `page.tsx`:

```tsx
import ComparisonResults from "@/components/ComparisonResults";

// Temporary test data — remove after verification
const testResult = {
  prompt: "Explain quantum computing in simple terms",
  timestamp: Date.now(),
  responses: [
    { modelId: "gpt-4o", content: "# Quantum Computing\n\nQuantum computing uses **qubits** instead of bits...\n\n```python\nprint('hello quantum')\n```", error: null, latencyMs: 1234, status: "success" as const },
    { modelId: "claude-sonnet-4-5-20250514", content: null, error: null, latencyMs: 0, status: "loading" as const },
    { modelId: "gemini-2.0-flash", content: null, error: "Google API key not configured", latencyMs: 0, status: "error" as const },
  ],
};
```

Render `<ComparisonResults result={testResult} />` temporarily to see all three states. **Remove the test data after visual verification.**
