# Task 3: Build the Prompt Input Form with Model Selection

## Context

After Tasks 1-2, you have a working Next.js project with TypeScript types, a model registry, and constants defined in `src/lib/`. The main page (`src/app/page.tsx`) shows a placeholder heading.

Now you need to build the primary user input area: a textarea for entering a prompt, model selection checkboxes, and a submit button.

## Goal

Create client-side components for prompt input and model selection. Wire them into the main page with a no-op submit handler (the real API call comes in Task 6). The UI should be visually polished with the dark theme.

## Dependencies

- Task 1 (project setup)
- Task 2 (types in `src/lib/types.ts`, models in `src/lib/models.ts`, constants in `src/lib/constants.ts`)

## Steps

### 1. Create the components directory

```bash
mkdir -p src/components
```

### 2. Create `src/components/ModelCheckbox.tsx`

A small presentational component for a single model toggle:

```tsx
"use client";

import { ModelConfig } from "@/lib/types";
import { PROVIDER_COLORS } from "@/lib/constants";

interface ModelCheckboxProps {
  model: ModelConfig;
  checked: boolean;
  onChange: (modelId: string, checked: boolean) => void;
}
```

**Requirements:**
- Render a styled checkbox with the model's `name` as label
- Show a small colored badge/dot next to the name indicating the provider (use `PROVIDER_COLORS` from constants)
- The provider name should be shown in small text (e.g., "OpenAI" next to "GPT-4o")
- Use a `<label>` wrapping both the checkbox and text for accessibility (clicking the text toggles the checkbox)
- Style: rounded border, subtle background on hover, padding for comfortable click targets
- The entire component should feel like a selectable card/chip, not a raw checkbox

### 3. Create `src/components/PromptInput.tsx`

The main input form component:

```tsx
"use client";

import { useState } from "react";
import { ComparisonRequest } from "@/lib/types";
import { AVAILABLE_MODELS } from "@/lib/models";
import { getModelsByProvider } from "@/lib/models";
import { MAX_PROMPT_LENGTH } from "@/lib/constants";
import ModelCheckbox from "./ModelCheckbox";

interface PromptInputProps {
  onSubmit: (request: ComparisonRequest) => void;
  loading: boolean;
}
```

**Requirements:**

#### Textarea
- Large `<textarea>` with placeholder text: "Enter your prompt here... What do you want to ask the AI models?"
- Character counter below the textarea showing `{current} / {MAX_PROMPT_LENGTH}`
- The counter text should turn yellow when over 80% and red when at limit
- Enforce `maxLength={MAX_PROMPT_LENGTH}` on the textarea
- Style: dark background (`bg-gray-900`), border, rounded corners, generous padding, full width, minimum 4 rows

#### Model Selection
- Section header: "Select Models" with a small count indicator "(X selected)"
- Render `ModelCheckbox` for each model, **grouped by provider**
- Each provider group has a subtle label ("OpenAI", "Anthropic", "Google")
- Default checked state comes from each model's `enabled` property
- Store selected model IDs in component state using `useState`

#### Submit Button
- Text: "Compare" (or "Comparing..." when loading)
- **Disabled** when ANY of these conditions are true:
  - Prompt is empty or whitespace-only
  - Fewer than 2 models are selected
  - `loading` prop is `true`
- When disabled, style with reduced opacity and `cursor-not-allowed`
- When loading, show a simple spinner animation (CSS-only, use a rotating border trick)
- Style: prominent button, full width or auto width, colored background (e.g., `bg-blue-600 hover:bg-blue-700`)

#### Keyboard Shortcut
- `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) triggers submit when the form is valid
- Add a small hint text below the button: "⌘ + Enter to submit" (detect OS for correct modifier)

#### Form Submit Handler
- On submit, call `props.onSubmit({ prompt, modelIds: selectedModelIds })`
- Do NOT clear the textarea after submit (user may want to re-compare)

### 4. Update `src/app/page.tsx`

Import and render the `PromptInput` component. Replace the existing placeholder:

```tsx
"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import { ComparisonRequest } from "@/lib/types";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (request: ComparisonRequest) => {
    // TODO: Will be connected to API in Task 6
    console.log("Comparison requested:", request);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-white text-center">{APP_NAME}</h1>
        <p className="mt-2 text-lg text-gray-400 text-center">{APP_DESCRIPTION}</p>
        <div className="mt-10">
          <PromptInput onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </main>
  );
}
```

## Files Created/Modified

| File | Action |
|------|--------|
| `src/components/ModelCheckbox.tsx` | Created — individual model toggle component |
| `src/components/PromptInput.tsx` | Created — main input form with textarea, model selection, submit button |
| `src/app/page.tsx` | Modified — renders PromptInput with no-op handler |

## Acceptance Criteria

- [ ] `npm run build` succeeds with no errors
- [ ] The page renders a textarea, model checkboxes grouped by provider, and a "Compare" button
- [ ] Typing in the textarea shows a live character count (e.g., "142 / 4000")
- [ ] Character count turns yellow at 80% capacity and red at 100%
- [ ] Model checkboxes are grouped under provider headings (OpenAI, Anthropic, Google)
- [ ] Default checked models match the `enabled` field in the model registry (GPT-4o, Claude Sonnet 4.5, Gemini 2.0 Flash)
- [ ] Selecting/deselecting model checkboxes works correctly
- [ ] Selected model count is displayed (e.g., "Select Models (3 selected)")
- [ ] The "Compare" button is disabled when the prompt is empty
- [ ] The "Compare" button is disabled when fewer than 2 models are selected
- [ ] The "Compare" button is disabled and shows "Comparing..." with a spinner when `loading` is true
- [ ] `Cmd+Enter` (Mac) or `Ctrl+Enter` triggers submit when the form is valid
- [ ] Clicking "Compare" logs the request to the browser console (temporary, for verification)
- [ ] The UI has consistent dark theme styling with proper spacing and typography
- [ ] Each model checkbox shows a colored provider badge
