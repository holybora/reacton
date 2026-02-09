"use client";

import { useState, useEffect } from "react";
import { ModelResponse, Provider, TokenStatus } from "@/lib/types";
import { MODELS_BY_PROVIDER, getModelById } from "@/lib/models";
import { PROVIDER_COLORS } from "@/lib/constants";
import { useTokenValidation } from "@/hooks/useTokenValidation";
import ModelSelector from "./ModelSelector";
import ApiTokenInput from "./ApiTokenInput";
import ResponsePreview from "./ResponsePreview";
import ExpandableOutput from "./ExpandableOutput";

export interface CardComponentProps {
  provider: Provider;
  defaultModelId?: string;
  response: ModelResponse | null;
  onModelChange?: (modelId: string) => void;
  onTokenChange?: (token: string) => void;
  onTokenStatusChange?: (status: TokenStatus) => void;
}

export default function CardComponent({
  provider,
  defaultModelId,
  response,
  onModelChange,
  onTokenChange,
  onTokenStatusChange,
}: CardComponentProps) {
  const models = MODELS_BY_PROVIDER[provider];
  const [selectedModelId, setSelectedModelId] = useState<string>(
    defaultModelId ?? models[0].id
  );
  const [apiToken, setApiToken] = useState<string>("");

  const tokenStatus = useTokenValidation(provider, apiToken);

  useEffect(() => {
    onTokenStatusChange?.(tokenStatus);
  }, [tokenStatus, onTokenStatusChange]);

  const selectedModel = getModelById(selectedModelId);
  const colors = PROVIDER_COLORS[provider];

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    onModelChange?.(modelId);
  };

  const handleTokenChange = (token: string) => {
    setApiToken(token);
    onTokenChange?.(token);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
      {/* Header: Model name + provider badge */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {selectedModel?.name ?? "Select a model"}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
        >
          {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </span>
      </div>

      {/* Controls: Model selector + API token */}
      <div className="px-4 py-4 space-y-4">
        <ModelSelector
          provider={provider}
          selectedModelId={selectedModelId}
          onChange={handleModelChange}
        />
        <ApiTokenInput
          value={apiToken}
          onChange={handleTokenChange}
          tokenStatus={tokenStatus}
        />
      </div>

      {/* Response preview */}
      <div className="px-4 pb-4 flex-1">
        <ResponsePreview
          content={response?.content ?? null}
          isLoading={response?.status === "loading"}
          error={response?.error ?? null}
        />
      </div>

      {/* Latency display */}
      {response?.status === "success" && response.latencyMs > 0 && (
        <div className="px-4 pb-2">
          <span className="text-xs text-gray-500">
            {(response.latencyMs / 1000).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Expandable raw output */}
      <ExpandableOutput content={response?.content ?? null} />
    </div>
  );
}
