"use client";

import { ChevronDown } from "lucide-react";
import { AI_PROVIDERS } from "@/lib/aiModels";

export default function AiModelSelector({ value, onChange, disabled = false }) {
  return (
    <div className="relative inline-flex max-w-full items-center">
      <select
        aria-label="AI model"
        title="Choose an AI model"
        value={`${value.provider}:${value.model}`}
        disabled={disabled}
        onChange={(event) => {
          const [provider, ...model] = event.target.value.split(":");
          onChange({ provider, model: model.join(":") });
        }}
        className="h-8 max-w-full appearance-none rounded-lg border border-white/10 bg-[#17191f] py-1 pl-3 pr-8 text-xs font-medium text-gray-300 outline-none transition-colors hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5eadff]/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {Object.entries(AI_PROVIDERS).map(([provider, config]) => (
          <optgroup key={provider} label={config.label}>
            {config.models.map((model) => (
              <option key={model.id} value={`${provider}:${model.id}`}>
                {model.label.split(" · ")[0]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 h-3 w-3 text-gray-500" />
    </div>
  );
}
