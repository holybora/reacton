import { API_TIMEOUT_MS } from "@/lib/constants";
import type { ProviderCallResult } from "./types";

const VALIDATION_TIMEOUT_MS = 10_000;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function classifyError(status: number, body: Record<string, unknown>): string {
  if (status === 401 || status === 403) return "Authentication failed. Check your API token.";
  if (status === 429) return "Rate limit exceeded. Try again later.";
  if (status === 404) return "Model not found. It may not be available.";
  if (status >= 500) return "Provider server error. Try again later.";
  const err = body?.error as Record<string, unknown> | undefined;
  const msg = err?.message;
  return typeof msg === "string" ? msg : `Google API error: ${status}`;
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/models?key=${encodeURIComponent(token)}`, {
      method: "GET",
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
  const url = `${BASE_URL}/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(token)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
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
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No content in response.");
  return { content };
}
