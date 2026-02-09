import { API_TIMEOUT_MS } from "@/lib/constants";
import type { ProviderCallResult } from "./types";

const VALIDATION_TIMEOUT_MS = 10_000;

function classifyError(status: number, body: Record<string, unknown>): string {
  if (status === 401 || status === 403) return "Authentication failed. Check your API token.";
  if (status === 429) return "Rate limit exceeded. Try again later.";
  if (status === 404) return "Model not found. It may not be available.";
  if (status >= 500) return "Provider server error. Try again later.";
  const msg = (body?.error as Record<string, unknown>)?.message;
  return typeof msg === "string" ? msg : `OpenAI API error: ${status}`;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(VALIDATION_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function callModel(
  prompt: string,
  systemPrompt: string,
  token: string,
  modelId: string
): Promise<ProviderCallResult> {
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Request timed out after 60 seconds.");
    }
    throw new Error("Network error. Check your connection.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(classifyError(res.status, body));
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response.");
  return { content };
}
