"use client";

import { useState, useEffect, useRef } from "react";
import type { Provider, TokenStatus, ValidateTokenResponse } from "@/lib/types";
import { TOKEN_VALIDATION_DEBOUNCE_MS } from "@/lib/constants";

export function useTokenValidation(
  provider: Provider,
  token: string
): TokenStatus {
  const [status, setStatus] = useState<TokenStatus>("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setStatus("idle");
      return;
    }

    setStatus("validating");

    const timeoutId = setTimeout(async () => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, token }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const data: ValidateTokenResponse = await res.json();
        setStatus(data.valid ? "valid" : "invalid");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        )
          return;
        setStatus("invalid");
      }
    }, TOKEN_VALIDATION_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [provider, token]);

  return status;
}
