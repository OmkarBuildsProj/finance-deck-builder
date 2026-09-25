import type { DeckSettings, SlideOutline } from "@/types/slides";

export type DeckDraft = {
  slides: SlideOutline;
  settings: DeckSettings;
};

const STORAGE_KEY = "deckflow-deck";

let draft: DeckDraft | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeDeckDraft(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStoredDraft(): DeckDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DeckDraft;
    if (!parsed || !Array.isArray(parsed.slides) || !parsed.settings) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getDeckDraft(): DeckDraft | null {
  if (!hydrated) {
    draft = readStoredDraft();
    hydrated = true;
  }
  return draft;
}

export function setDeckDraft(next: DeckDraft) {
  draft = next;
  hydrated = true;

  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  emit();
}

export function setDeckSlides(slides: SlideOutline) {
  const current = getDeckDraft();
  if (!current) {
    return;
  }

  setDeckDraft({ ...current, slides });
}
