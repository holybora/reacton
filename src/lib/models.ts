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
