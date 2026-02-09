"use client";

import { useState, useCallback } from "react";
import { CardComponent } from "@/components/card";
import { ModelResponse, Provider, TokenStatus, CompareResponse } from "@/lib/types";
import { APP_NAME, APP_DESCRIPTION, MAX_PROMPT_LENGTH } from "@/lib/constants";

const CARDS: { provider: Provider; defaultModelId: string }[] = [
  { provider: "openai", defaultModelId: "gpt-5.2" },
  { provider: "anthropic", defaultModelId: "claude-opus-4-6" },
  { provider: "google", defaultModelId: "gemini-3-pro-preview" },
];

interface CardState {
  provider: Provider;
  modelId: string;
  token: string;
  tokenStatus: TokenStatus;
  response: ModelResponse | null;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<CardState[]>(
    CARDS.map((c) => ({
      provider: c.provider,
      modelId: c.defaultModelId,
      token: "",
      tokenStatus: "idle" as TokenStatus,
      response: null,
    }))
  );

  const isLoading = cards.some((c) => c.response?.status === "loading");
  const hasTokens = cards.some((c) => c.token.trim());

  const handleModelChange = (index: number, modelId: string) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, modelId } : card))
    );
  };

  const handleTokenChange = (index: number, token: string) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, token } : card))
    );
  };

  const handleTokenStatusChange = useCallback(
    (index: number, status: TokenStatus) => {
      setCards((prev) =>
        prev.map((card, i) =>
          i === index ? { ...card, tokenStatus: status } : card
        )
      );
    },
    []
  );

  const handleCompare = async () => {
    const activeCards = cards.filter((card) => card.token.trim());
    if (activeCards.length === 0 || !prompt.trim()) return;

    // Set active cards to loading
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        response: card.token.trim()
          ? {
              modelId: card.modelId,
              content: null,
              error: null,
              latencyMs: 0,
              status: "loading" as const,
            }
          : card.response,
      }))
    );

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          models: activeCards.map((card) => ({
            provider: card.provider,
            modelId: card.modelId,
            token: card.token,
          })),
        }),
      });

      const data: CompareResponse = await res.json();

      setCards((prev) =>
        prev.map((card) => {
          const modelResponse = data.responses.find(
            (r) => r.modelId === card.modelId
          );
          return modelResponse ? { ...card, response: modelResponse } : card;
        })
      );
    } catch (error) {
      setCards((prev) =>
        prev.map((card) =>
          card.token.trim()
            ? {
                ...card,
                response: {
                  modelId: card.modelId,
                  content: null,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Network error. Check your connection.",
                  latencyMs: 0,
                  status: "error" as const,
                },
              }
            : card
        )
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">{APP_NAME}</h1>
        <p className="mt-2 text-lg text-gray-400">{APP_DESCRIPTION}</p>
      </div>

      {/* Shared Prompt Input */}
      <div className="mb-8 max-w-3xl mx-auto w-full">
        <label className="block text-sm text-gray-400 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={MAX_PROMPT_LENGTH}
          placeholder="Describe a web component to generate..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </span>
          <button
            onClick={handleCompare}
            disabled={!prompt.trim() || !hasTokens || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {isLoading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <CardComponent
            key={card.provider}
            provider={card.provider}
            defaultModelId={card.modelId}
            response={card.response}
            onModelChange={(modelId) => handleModelChange(index, modelId)}
            onTokenChange={(token) => handleTokenChange(index, token)}
            onTokenStatusChange={(status) =>
              handleTokenStatusChange(index, status)
            }
          />
        ))}
      </div>
    </main>
  );
}
