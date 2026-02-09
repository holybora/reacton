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
