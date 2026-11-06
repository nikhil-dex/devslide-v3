"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_AI_SELECTION, resolveAiSelection } from "./aiModels";
import { getByokKey } from "./byok";

const KEY = "pptAiSelection";
const EVENT = "ppt-ai-selection";
let memorySelection = null;

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function snapshot() {
  try { return memorySelection ?? window.localStorage.getItem(KEY) ?? ""; }
  catch { return memorySelection ?? ""; }
}

export function useAiSelection() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  let selection = DEFAULT_AI_SELECTION;
  try { selection = resolveAiSelection(JSON.parse(raw)); } catch { /* use default */ }
  const hasByok = useSyncExternalStore(subscribe,
    () => Boolean(getByokKey(selection.provider)), () => false);
  const setSelection = (next) => {
    const serialized = JSON.stringify(resolveAiSelection(next));
    memorySelection = serialized;
    try {
      window.localStorage.setItem(KEY, serialized);
      memorySelection = null;
    } catch { /* retain the selection for this tab if storage is unavailable */ }
    window.dispatchEvent(new Event(EVENT));
  };
  return { selection, setSelection, hasByok, noCredits: selection.provider === "groq" || hasByok };
}
