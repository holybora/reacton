# Task 4: Create Next.js API Route for LLM Proxy Calls

## Context

After Tasks 1-2, you have a Next.js project with TypeScript types (`src/lib/types.ts`), a model registry (`src/lib/models.ts`), and constants (`src/lib/constants.ts`). The UI components are being built in parallel (Task 3, Task 5) but this task is independent of them.

## Goal

Build the server-side API route that receives a prompt and list of model IDs, fans out requests to the appropriate LLM provider APIs in parallel, and returns the collected responses. API keys stay on the server — never exposed to the client.

## Dependencies

- Task 1 (project setup, `.env.local` with API key variables)
- Task 2 (types in `src/lib/types.ts`, models in `src/lib/models.ts`, constants in `src/lib/constants.ts`)

## Steps

### 1. Create the provider modules directory

```bash
mkdir -p src/lib/providers
```

### 2. Create `src/lib/providers/openai.ts`

A function that calls the OpenAI Chat Completions API using `fetch` (no SDK):

```typescript
import { API_TIMEOUT_MS } from "@/lib/constants";

interface ProviderResponse {
  content: string;
  latencyMs: number;
}

export async function callOpenAI(modelId: string, prompt: string): Promise<ProviderResponse> {
  // implementation
}
```

**Requirements:**
- Read `process.env.OPENAI_API_KEY`. If not set or empty, throw an `Error("OpenAI API key not configured")`
- Make a POST request to `https://api.openai.com/v1/chat/completions`
- Request headers: `Authorization: Bearer {key}`, `Content-Type: application/json`
- Request body:
  ```json
  {
    "model": "{modelId}",
    "messages": [{ "role": "user", "content": "{prompt}" }],
    "max_tokens": 2048
  }
  ```
- Use `AbortSignal.timeout(API_TIMEOUT_MS)` for timeout
- Measure latency using `Date.now()` before and after the fetch
- Parse the response and extract `choices[0].message.content`
- If the response is not OK (non-2xx), throw an error with the status code and a generic message (do NOT leak the full error body which might contain key info)
- Return `{ content, latencyMs }`

### 3. Create `src/lib/providers/anthropic.ts`

A function that calls the Anthropic Messages API using `fetch`:

```typescript
import { API_TIMEOUT_MS } from "@/lib/constants";

interface ProviderResponse {
  content: string;
  latencyMs: number;
}

export async function callAnthropic(modelId: string, prompt: string): Promise<ProviderResponse> {
  // implementation
}
```

**Requirements:**
- Read `process.env.ANTHROPIC_API_KEY`. If not set or empty, throw an `Error("Anthropic API key not configured")`
- Make a POST request to `https://api.anthropic.com/v1/messages`
- Request headers:
  - `x-api-key: {key}`
  - `anthropic-version: 2023-06-01`
  - `content-type: application/json`
- Request body:
  ```json
  {
    "model": "{modelId}",
    "max_tokens": 2048,
    "messages": [{ "role": "user", "content": "{prompt}" }]
  }
  ```
- Use `AbortSignal.timeout(API_TIMEOUT_MS)` for timeout
- Measure latency using `Date.now()` before and after the fetch
- Parse the response and extract `content[0].text`
- Handle non-2xx responses the same as OpenAI (generic error, no key leakage)
- Return `{ content, latencyMs }`

### 4. Create `src/lib/providers/google.ts`

A function that calls the Google Gemini API using `fetch`:

```typescript
import { API_TIMEOUT_MS } from "@/lib/constants";

interface ProviderResponse {
  content: string;
  latencyMs: number;
}

export async function callGoogle(modelId: string, prompt: string): Promise<ProviderResponse> {
  // implementation
}
```

**Requirements:**
- Read `process.env.GOOGLE_API_KEY`. If not set or empty, throw an `Error("Google API key not configured")`
- Make a POST request to `https://generativelanguage.googleapis.com/v1beta/models/{modelId}:generateContent?key={key}`
- Request headers: `Content-Type: application/json`
- Request body:
  ```json
  {
    "contents": [{ "parts": [{ "text": "{prompt}" }] }]
  }
  ```
- Use `AbortSignal.timeout(API_TIMEOUT_MS)` for timeout
- Measure latency
- Parse the response and extract `candidates[0].content.parts[0].text`
- Handle non-2xx responses with generic error messages
- Return `{ content, latencyMs }`

### 5. Create `src/lib/providers/index.ts`

A barrel export with a dispatcher function:

```typescript
import { getModelById } from "@/lib/models";
import { callOpenAI } from "./openai";
import { callAnthropic } from "./anthropic";
import { callGoogle } from "./google";

interface ProviderResponse {
  content: string;
  latencyMs: number;
}

/**
 * Route a model call to the correct provider based on the model registry.
 * Throws if the model ID is not found or the provider is unknown.
 */
export async function callModel(modelId: string, prompt: string): Promise<ProviderResponse> {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  switch (model.provider) {
    case "openai":
      return callOpenAI(modelId, prompt);
    case "anthropic":
      return callAnthropic(modelId, prompt);
    case "google":
      return callGoogle(modelId, prompt);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}
```

### 6. Create `src/app/api/compare/route.ts`

The main POST endpoint:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ComparisonRequest, ComparisonResult, ModelResponse } from "@/lib/types";
import { getModelById } from "@/lib/models";
import { callModel } from "@/lib/providers";

export async function POST(request: NextRequest) {
  // implementation
}
```

**Requirements:**

#### Request Validation
- Parse the JSON body as `ComparisonRequest`
- Return 400 if:
  - `prompt` is missing or empty/whitespace-only
  - `modelIds` is missing or not a non-empty array
  - Any `modelId` in the array is not found in the model registry (use `getModelById`)
- Return clear error messages for each validation failure

#### Parallel Execution
- Use `Promise.allSettled()` to call all requested models in parallel
- Each individual model call uses the `callModel` dispatcher from the providers module
- This means one model's failure does NOT prevent other models from returning

#### Response Construction
- Build a `ComparisonResult` object:
  - `prompt`: the original prompt
  - `timestamp`: `Date.now()`
  - `responses`: array of `ModelResponse` objects, one per model
- For each settled promise:
  - If fulfilled: `{ modelId, content, error: null, latencyMs, status: "success" }`
  - If rejected: `{ modelId, content: null, error: (error message), latencyMs: 0, status: "error" }`
- **Critical:** Never include API keys, raw provider error details, or stack traces in the error messages. Use generic messages like "Failed to get response from GPT-4o" with the caught error's message appended (which will be the user-friendly messages from the provider modules, like "OpenAI API key not configured")

#### Response
- Return `NextResponse.json(result)` with status 200
- On validation errors, return `NextResponse.json({ error: "..." }, { status: 400 })`

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/providers/openai.ts` | OpenAI Chat Completions API caller |
| `src/lib/providers/anthropic.ts` | Anthropic Messages API caller |
| `src/lib/providers/google.ts` | Google Gemini API caller |
| `src/lib/providers/index.ts` | Provider dispatcher + barrel exports |
| `src/app/api/compare/route.ts` | POST `/api/compare` route handler |

## Acceptance Criteria

- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `POST /api/compare` with a valid body returns a JSON response matching the `ComparisonResult` type
- [ ] Sending an empty prompt returns 400 with a clear error message
- [ ] Sending unknown model IDs returns 400 with a clear error message
- [ ] If no API keys are configured in `.env.local`, each model's response has `status: "error"` and an error message like "OpenAI API key not configured" — the app does NOT crash
- [ ] Multiple model calls execute in parallel (not sequentially)
- [ ] One model failing does not prevent other models from returning successfully
- [ ] No API keys appear in any response body or error message sent to the client
- [ ] Each provider module correctly constructs the request format for its API (OpenAI chat format, Anthropic messages format, Google generateContent format)
- [ ] Timeout is enforced on each provider call via `AbortSignal.timeout()`

### Manual Testing

You can test the route with `curl`:

```bash
# Test validation (should return 400)
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"prompt": "", "modelIds": []}'

# Test with no API keys configured (should return 200 with error responses per model)
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "modelIds": ["gpt-4o", "claude-sonnet-4-5-20250514"]}'

# Test with actual API keys (fill in .env.local first)
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 2+2? Reply in one sentence.", "modelIds": ["gpt-4o", "claude-sonnet-4-5-20250514", "gemini-2.0-flash"]}'
```
