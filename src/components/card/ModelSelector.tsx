"use client";

import { Provider } from "@/lib/types";
import { MODELS_BY_PROVIDER } from "@/lib/models";

interface ModelSelectorProps {
  provider: Provider;
  selectedModelId: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({
  provider,
  selectedModelId,
  onChange,
}: ModelSelectorProps) {
  const models = MODELS_BY_PROVIDER[provider];

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">Model</label>
      <select
        value={selectedModelId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
