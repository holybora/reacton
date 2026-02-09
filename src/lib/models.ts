import { ModelConfig, Provider } from "./types";

export const OPENAI_MODELS: ModelConfig[] = [
  { id: "gpt-5.2", name: "GPT-5.2", provider: "openai", enabled: true },
  { id: "gpt-5", name: "GPT-5", provider: "openai", enabled: false },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "openai", enabled: false },
  { id: "o3", name: "O3", provider: "openai", enabled: false },
  { id: "o4-mini", name: "O4 Mini", provider: "openai", enabled: false },
];

export const ANTHROPIC_MODELS: ModelConfig[] = [
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "anthropic", enabled: true },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", provider: "anthropic", enabled: false },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic", enabled: false },
  { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5", provider: "anthropic", enabled: false },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", enabled: false },
];

export const GOOGLE_MODELS: ModelConfig[] = [
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", provider: "google", enabled: true },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "google", enabled: false },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", enabled: false },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", enabled: false },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "google", enabled: false },
];

export const AVAILABLE_MODELS: ModelConfig[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GOOGLE_MODELS,
];

export const MODELS_BY_PROVIDER: Record<Provider, ModelConfig[]> = {
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  google: GOOGLE_MODELS,
};

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
