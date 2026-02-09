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
