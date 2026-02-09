"use client";

import { useState } from "react";
import { CardComponent } from "@/components/card";
import { ModelResponse, Provider } from "@/lib/types";
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
  response: ModelResponse | null;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [cards, setCards] = useState<CardState[]>(
    CARDS.map((c) => ({ provider: c.provider, modelId: c.defaultModelId, token: "", response: null }))
  );

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
          placeholder="Enter your prompt here..."
          rows={4}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </span>
          <button
            disabled={!prompt.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Compare
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
          />
        ))}
      </div>
    </main>
  );
}
