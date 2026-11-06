"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { BYOK_STORAGE_KEYS, getByokKey } from "@/lib/byok";
import { AI_PROVIDERS } from "@/lib/aiModels";

export default function ProviderKeySettings({ provider }) {
  const [value, setValue] = useState(() => getByokKey(provider));
  const [active, setActive] = useState(() => Boolean(getByokKey(provider)));
  const [message, setMessage] = useState("");
  const label = AI_PROVIDERS[provider].label;
  const updateKey = (remove = false) => {
    try {
      if (remove) window.localStorage.removeItem(BYOK_STORAGE_KEYS[provider]);
      else window.localStorage.setItem(BYOK_STORAGE_KEYS[provider], value.trim());
      setActive(!remove);
      if (remove) setValue("");
      window.dispatchEvent(new Event("ppt-ai-selection"));
      setMessage(remove ? "Key removed from this browser." : "Key saved in this browser.");
    } catch {
      setMessage("Browser storage is unavailable. The key could not be updated.");
    }
  };
  return <div className="glass-card p-8">
    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
      <KeyRound className="w-5 h-5 text-[#5eadff]" /> Your own {label} API key
    </h3>
    <p className="mt-2 mb-4 text-sm text-gray-400">
      Saved only in this browser and sent through the server to {label} when you select that provider.
      Your key uses no app credits; provider quotas and charges still apply.{" "}
      <a href={provider === "groq" ? "https://console.groq.com/keys" : "https://aistudio.google.com/apikey"}
        target="_blank" rel="noopener noreferrer" className="text-[#5eadff] underline">Get a {label} key</a>.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <input type="password" aria-label={`${label} API key`} value={value} autoComplete="off" spellCheck={false}
        onChange={(event) => { setValue(event.target.value); setMessage(""); }}
        placeholder={provider === "groq" ? "gsk_..." : "AIza..."}
        className="min-w-0 flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 text-sm" />
      <button type="button" onClick={() => updateKey()} disabled={!value.trim()} className="btn-accent px-6 py-3 rounded-xl">Save key</button>
      {active && <button type="button" onClick={() => updateKey(true)} className="px-4 py-3 text-gray-300">Remove key</button>}
    </div>
    {message && <p role="status" className="mt-3 text-sm text-gray-300">{message}</p>}
  </div>;
}
