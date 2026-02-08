# Task 2: Define TypeScript Types, Model Registry, and Shared Constants

## Context

After Task 1, you have a working Next.js + TypeScript + Tailwind project with a placeholder page. Now you need to establish the data model that all subsequent tasks depend on.

## Goal

Create the core TypeScript interfaces, a model registry listing all available LLMs, and shared constants. These files form the shared contract between the UI components (Tasks 3, 5) and the API routes (Task 4).

## Dependencies

- Task 1 must be completed (project must be initialized, `src/` directory must exist)

## Steps

### 1. Create the lib directory

```bash
mkdir -p src/lib
```

### 2. Create `src/lib/types.ts`

Define all core TypeScript types used throughout the app:

```typescript
export type Provider = "openai" | "anthropic" | "google";

export interface ModelConfig {
  /** Unique model identifier sent to the provider API, e.g. "gpt-4o" */
  id: string;
  /** Human-readable display name, e.g. "GPT-4o" */
  name: string;
  /** Which LLM provider this model belongs to */
  provider: Provider;
  /** Whether this model is selected by default in the UI */
  enabled: boolean;
}

export interface ComparisonRequest {
  /** The user's prompt to send to all selected models */
  prompt: string;
  /** Array of model IDs to query */
  modelIds: string[];
}

export interface ModelResponse {
  /** Which model produced this response */
  modelId: string;
  /** The model's text response, or null if error/loading */
  content: string | null;
  /** Error message, or null if success/loading */
  error: string | null;
  /** How long the API call took in milliseconds */
  latencyMs: number;
  /** Current state of this response */
  status: "loading" | "success" | "error";
}

export interface ComparisonResult {
  /** The original prompt that was sent */
  prompt: string;
  /** One response per requested model */
  responses: ModelResponse[];
  /** When the comparison was initiated (Date.now()) */
  timestamp: number;
}
```

### 3. Create `src/lib/models.ts`

Define the registry of available models. This single array drives both the UI checkboxes and the API routing logic:

```typescript
import { ModelConfig } from "./types";

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", enabled: true },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", enabled: false },

  // Anthropic
  { id: "claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5", provider: "anthropic", enabled: true },
  { id: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5", provider: "anthropic", enabled: false },

  // Google
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", enabled: true },
];

/**
 * Look up a model config by its ID.
 * Returns undefined if not found.
 */
export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}

/**
 * Get all unique providers from the model registry.
 */
export function getProviders(): string[] {
  return [...new Set(AVAILABLE_MODELS.map((m) => m.provider))];
}

/**
 * Get models grouped by provider.
 * Returns a Map where keys are provider names and values are arrays of ModelConfig.
 */
export function getModelsByProvider(): Map<string, ModelConfig[]> {
  const grouped = new Map<string, ModelConfig[]>();
  for (const model of AVAILABLE_MODELS) {
    const existing = grouped.get(model.provider) || [];
    existing.push(model);
    grouped.set(model.provider, existing);
  }
  return grouped;
}
```

### 4. Create `src/lib/constants.ts`

Define shared constants referenced by multiple parts of the app:

```typescript
/** Maximum number of characters allowed in a prompt */
export const MAX_PROMPT_LENGTH = 4000;

/** Timeout for individual LLM API calls in milliseconds (60 seconds) */
export const API_TIMEOUT_MS = 60_000;

/** App name shown in the UI */
export const APP_NAME = "LLM Compare";

/** App description shown in the UI and metadata */
export const APP_DESCRIPTION = "Compare responses from different LLMs side-by-side";

/** Provider display colors for UI badges (Tailwind color classes) */
export const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  openai: { bg: "bg-green-900/50", text: "text-green-400" },
  anthropic: { bg: "bg-orange-900/50", text: "text-orange-400" },
  google: { bg: "bg-blue-900/50", text: "text-blue-400" },
};
```

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Core TypeScript interfaces: `Provider`, `ModelConfig`, `ComparisonRequest`, `ModelResponse`, `ComparisonResult` |
| `src/lib/models.ts` | Model registry (`AVAILABLE_MODELS` array) + helper functions (`getModelById`, `getProviders`, `getModelsByProvider`) |
| `src/lib/constants.ts` | Shared constants: `MAX_PROMPT_LENGTH`, `API_TIMEOUT_MS`, `APP_NAME`, `APP_DESCRIPTION`, `PROVIDER_COLORS` |

## Acceptance Criteria

- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] All types are exported and importable via `@/lib/types`
- [ ] The model registry in `@/lib/models` contains exactly 5 models across 3 providers
- [ ] Each model has a unique `id`, a human-readable `name`, a `provider`, and an `enabled` default
- [ ] `getModelById("gpt-4o")` returns the correct model config
- [ ] `getModelsByProvider()` returns a Map with 3 entries (openai, anthropic, google)
- [ ] Constants are importable from `@/lib/constants`
- [ ] `PROVIDER_COLORS` has entries for all 3 providers
- [ ] No unused imports or variables in any file
