# Task 6: Wire Everything Together and Polish the Full Flow

## Context

After Tasks 1-5, you have:
- A Next.js project with TypeScript and Tailwind CSS (Task 1)
- Shared types, model registry, and constants in `src/lib/` (Task 2)
- A prompt input form with model selection in `src/components/PromptInput.tsx` (Task 3)
- API routes that proxy LLM calls in `src/app/api/compare/route.ts` (Task 4)
- Response display components with loading/error/success states in `src/components/` (Task 5)

All the pieces exist but are not connected. The main page currently has a no-op submit handler and no response display.

## Goal

Wire the prompt input → API call → response display into a complete end-to-end flow. Add error handling for network failures, an empty state for first-time visitors, and overall UI polish. After this task, the app is a fully functional V1.

## Dependencies

- ALL prior tasks (1 through 5) must be completed

## Steps

### 1. Create `src/components/EmptyState.tsx`

A component shown when no comparison has been made yet:

**Requirements:**
- Centered layout with vertical stacking
- A large, muted icon or emoji at the top (e.g., "🔄" or a simple SVG of two arrows comparing)
- Heading: "Ready to Compare"
- Body text: "Enter a prompt above and select at least 2 models to compare their responses side-by-side."
- Style: muted colors (`text-gray-500`), centered, generous padding, subtle — should not compete with the input form
- Keep it simple — no complex illustrations

### 2. Create `src/components/ErrorBanner.tsx`

A dismissible error banner for network/API-level errors (not individual model errors):

```tsx
"use client";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}
```

**Requirements:**
- Full-width banner with red background (`bg-red-900/50 border border-red-800`)
- Error icon on the left (simple "!" circle or SVG)
- Error message text
- Dismiss button ("×") on the right that calls `onDismiss`
- Rounded corners, proper padding
- Should appear above the results area

### 3. Update `src/app/page.tsx` — The Main Orchestrator

This is the most critical file. It connects all the pieces:

```tsx
"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import ComparisonResults from "@/components/ComparisonResults";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import { ComparisonRequest, ComparisonResult, ModelResponse } from "@/lib/types";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
```

**State variables:**
```typescript
const [result, setResult] = useState<ComparisonResult | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Submit handler implementation:**

```typescript
const handleSubmit = async (request: ComparisonRequest) => {
  setLoading(true);
  setError(null);

  // Step 1: Immediately show loading state with skeleton cards
  const loadingResponses: ModelResponse[] = request.modelIds.map((modelId) => ({
    modelId,
    content: null,
    error: null,
    latencyMs: 0,
    status: "loading" as const,
  }));

  setResult({
    prompt: request.prompt,
    responses: loadingResponses,
    timestamp: Date.now(),
  });

  try {
    // Step 2: Call the API
    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    // Step 3: Update with real results
    const data: ComparisonResult = await res.json();
    setResult(data);
  } catch (err) {
    // Step 4: Handle network/parsing errors
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    setError(message);

    // Keep the result with error status so users see something
    setResult((prev) =>
      prev
        ? {
            ...prev,
            responses: prev.responses.map((r) => ({
              ...r,
              status: "error" as const,
              error: r.status === "loading" ? message : r.error,
            })),
          }
        : null
    );
  } finally {
    setLoading(false);
  }
};
```

**Clear handler:**
```typescript
const handleClear = () => {
  setResult(null);
  setError(null);
};
```

**Page layout:**

```tsx
return (
  <main className="min-h-screen flex flex-col items-center px-4 py-12">
    <div className="w-full max-w-3xl">
      {/* Header */}
      <h1 className="text-4xl font-bold text-white text-center">{APP_NAME}</h1>
      <p className="mt-2 text-lg text-gray-400 text-center">{APP_DESCRIPTION}</p>

      {/* Input Form */}
      <div className="mt-10">
        <PromptInput onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>

    {/* Results Section — wider to accommodate grid */}
    <div className="w-full max-w-6xl mt-10">
      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Results or Empty State */}
      {result ? (
        <div>
          {/* Clear Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClear}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Results
            </button>
          </div>

          <ComparisonResults result={result} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  </main>
);
```

**Key behaviors:**
- The prompt input area is narrower (`max-w-3xl`) than the results area (`max-w-6xl`) to give response cards more room
- Loading skeletons appear immediately when the user clicks "Compare" (before the API responds)
- The textarea retains its content after submission (do NOT clear it)
- The "Clear Results" button resets the results area to the empty state
- Network errors show the `ErrorBanner` AND update loading cards to error state

### 4. Add a fade-in animation for results

Add a CSS animation to `src/app/globals.css`:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

Then wrap the results section in `<div className="animate-fade-in">` so it smoothly appears.

### 5. Remove any temporary test data

If Task 5 left temporary test data in `page.tsx` or any component, remove it now. All data should flow through the real API.

### 6. Final verification

Run the following checks:

```bash
# Build check
npm run build

# Start the dev server
npm run dev
```

Then manually test these scenarios:

1. **First visit:** Page shows the empty state with helpful instructions
2. **Empty prompt:** "Compare" button is disabled
3. **Single model selected:** "Compare" button is disabled
4. **Valid submission (no API keys):** Loading skeletons appear immediately, then error cards show "API key not configured" messages per model
5. **Valid submission (with API keys):** Loading skeletons appear, then real responses render with markdown formatting
6. **Network error:** Error banner appears above results
7. **Clear button:** Clicking "Clear Results" returns to the empty state
8. **Re-submit:** The textarea retains its content, allowing quick re-comparison with different model selections

## Files Created/Modified

| File | Action |
|------|--------|
| `src/components/EmptyState.tsx` | Created — placeholder shown before first comparison |
| `src/components/ErrorBanner.tsx` | Created — dismissible error banner for network errors |
| `src/app/page.tsx` | Modified — full orchestration: state management, API calls, conditional rendering |
| `src/app/globals.css` | Modified — added fade-in animation |

## Acceptance Criteria

- [ ] `npm run build` succeeds with no errors or warnings
- [ ] `npm run dev` starts cleanly
- [ ] **Empty state:** First visit shows "Ready to Compare" with instructions
- [ ] **Form validation:** "Compare" button is disabled when prompt is empty or fewer than 2 models selected
- [ ] **Loading state:** Clicking "Compare" immediately shows skeleton cards for each selected model
- [ ] **API integration:** The form calls `POST /api/compare` with the correct payload
- [ ] **Success rendering:** Responses render as formatted markdown with latency and copy buttons
- [ ] **Error handling (per-model):** If API keys are missing, each card shows its own error message
- [ ] **Error handling (network):** If the fetch itself fails, an error banner appears above results
- [ ] **Clear button:** "Clear Results" resets to the empty state
- [ ] **Textarea persistence:** The prompt text is preserved after submission
- [ ] **Animation:** Results appear with a subtle fade-in animation (no jarring layout shifts)
- [ ] **Responsive layout:** Results grid is 1 col on mobile, 2 cols on tablet, 3 cols on desktop
- [ ] **No console errors:** No React warnings, TypeScript errors, or unhandled promise rejections in the browser console
- [ ] **No test data:** All temporary/mock data has been removed — everything uses the real API
