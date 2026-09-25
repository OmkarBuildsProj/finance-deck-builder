"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Spinner } from "../components/spinner";
import {
  getDeckDraft,
  setDeckSlides,
  subscribeDeckDraft,
} from "../lib/deck-session";
import type { ChartType, Slide, SlideType } from "@/types/slides";

const TYPE_LABELS: Record<SlideType, string> = {
  title: "Title",
  summary: "Summary",
  chart: "Chart",
  kpi: "KPI",
  table: "Table",
  closing: "Closing",
};

type KpiItem = {
  label: string;
  value: string;
};

function presentationTitle(slides: Slide[], companyName: string) {
  const titleSlide = slides.find((slide) => slide.type === "title");
  const fromSlide = titleSlide?.title.trim();
  if (fromSlide) {
    return fromSlide;
  }
  const company = companyName.trim();
  return company || "Presentation";
}

function asLines(content: Slide["content"]) {
  const lines = Array.isArray(content) ? content : content.split(/\r?\n/);
  return lines.map((line) => line.trim()).filter(Boolean);
}

function parseKpi(raw: string): KpiItem {
  const text = raw.trim();
  const parts = text
    .split("|")
    .map((part) => part.replace(/[↑↓▲▼⬆⬇]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { label: parts[0], value: parts[1] };
  }

  const colon = text.indexOf(":");
  if (colon > 0) {
    return {
      label: text.slice(0, colon).trim(),
      value: text.slice(colon + 1).replace(/[↑↓▲▼⬆⬇]/g, "").trim(),
    };
  }

  return { label: "Metric", value: text.replace(/[↑↓▲▼⬆⬇]/g, "").trim() };
}

function chartLabel(chartType: ChartType | undefined) {
  const type = chartType ?? "bar";
  return `Chart: ${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function SlideContent({
  slide,
  expanded,
}: {
  slide: Slide;
  expanded: boolean;
}) {
  if (slide.type === "chart") {
    return (
      <p className={expanded ? "text-2xl font-medium text-white" : "text-sm text-gray-300"}>
        {chartLabel(slide.chartData?.chartType)}
      </p>
    );
  }

  if (slide.type === "kpi") {
    const items = asLines(slide.content).slice(0, expanded ? 6 : 3).map(parseKpi);
    if (items.length === 0) {
      return <p className="text-sm text-gray-500">No metrics</p>;
    }

    return (
      <div className={`grid gap-3 ${items.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="min-w-0">
            <p className={expanded ? "text-3xl font-semibold tracking-tight text-white" : "truncate text-lg font-semibold tracking-tight text-white"}>
              {item.value}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }

  const lines = asLines(slide.content);
  const showBullets = slide.type === "summary" || slide.type === "closing" || Array.isArray(slide.content);

  if (showBullets && lines.length > 0) {
    const visible = expanded ? lines : lines.slice(0, 3);
    return (
      <ul className={`space-y-1.5 text-gray-400 ${expanded ? "text-base leading-relaxed" : "text-xs leading-relaxed"}`}>
        {visible.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gray-500" />
            <span className={expanded ? "" : "line-clamp-2"}>{line}</span>
          </li>
        ))}
      </ul>
    );
  }

  const prose = lines.join(" ");
  if (!prose) {
    return <p className="text-sm text-gray-500">No content</p>;
  }

  return (
    <p className={expanded ? "text-base leading-relaxed text-gray-300" : "line-clamp-4 text-xs leading-relaxed text-gray-400"}>
      {prose}
    </p>
  );
}

function SlideCard({
  slide,
  index,
  dragging,
  dropTarget,
  onOpen,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  slide: Slide;
  index: number;
  dragging: boolean;
  dropTarget: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: (fromIndex: number) => void;
  onDragEnd: () => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        onDrop(fromIndex);
      }}
      onDragEnd={onDragEnd}
      className={`group relative flex aspect-[16/10] cursor-grab flex-col rounded-2xl border bg-[#111111] p-4 text-left transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(59,130,246,0.16)] active:cursor-grabbing ${
        dropTarget ? "border-white/40" : "border-[#222222] hover:border-[#3B82F6]/60"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-0 flex-1 flex-col text-left outline-none"
      >
        <div className="flex items-center gap-2 pr-8">
          <span className="text-xs tabular-nums text-gray-500">{number}</span>
          <span className="rounded-full border border-[#222222] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {TYPE_LABELS[slide.type]}
          </span>
        </div>
        <h2 className="mt-3 line-clamp-2 text-sm font-semibold tracking-tight text-white">
          {slide.title || "Untitled"}
        </h2>
        <div className="mt-3 min-h-0 flex-1 overflow-hidden">
          <SlideContent slide={slide} expanded={false} />
        </div>
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove slide ${index + 1}`}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors duration-300 hover:bg-white/5 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </article>
  );
}

function SlideModal({
  slide,
  index,
  onClose,
}: {
  slide: Slide;
  index: number;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#222222] bg-[#111111] p-5 shadow-2xl sm:p-8 md:p-10"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-gray-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full border border-[#222222] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {TYPE_LABELS[slide.type]}
              </span>
            </div>
            <h2 id={titleId} className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {slide.title || "Untitled"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors duration-300 hover:bg-white/5 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-8">
          <SlideContent slide={slide} expanded />
        </div>
      </div>
    </div>
  );
}

export function PreviewBoard() {
  const router = useRouter();
  const draft = useSyncExternalStore(subscribeDeckDraft, getDeckDraft, () => null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const didDrag = useRef(false);

  useEffect(() => {
    const stored = getDeckDraft();
    if (!stored || stored.slides.length === 0) {
      router.replace("/customize");
      return;
    }
    setSessionReady(true);
  }, [router]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const slides = draft?.slides ?? [];
  const settings = draft?.settings;
  const title = presentationTitle(slides, settings?.companyName ?? "");
  const openSlide = openIndex !== null ? slides[openIndex] : undefined;

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= slides.length || to >= slides.length) {
      return;
    }
    const next = slides.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDeckSlides(next);
    setOpenIndex(null);
  };

  const download = async () => {
    if (!settings || slides.length === 0) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, settings }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not generate the presentation.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "presentation.pptx";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setToast("Your presentation is ready.");
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not generate the presentation.");
    } finally {
      setDownloading(false);
    }
  };

  if (!sessionReady || !draft) {
    return (
      <div className="flex flex-1 items-center justify-center py-24" aria-busy="true">
        <Spinner className="h-8 w-8 border-[#3B82F6]/30 border-t-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">
          {slides.length} {slides.length === 1 ? "slide" : "slides"}
        </p>
      </header>

      {slides.length === 0 ? (
        <p className="mt-16 text-center text-sm text-gray-500">All slides have been removed.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, index) => (
            <SlideCard
              key={`${slide.type}-${slide.title}-${index}`}
              slide={slide}
              index={index}
              dragging={dragIndex === index}
              dropTarget={overIndex === index && dragIndex !== index}
              onOpen={() => {
                if (didDrag.current) {
                  didDrag.current = false;
                  return;
                }
                setOpenIndex(index);
              }}
              onDelete={() => {
                const next = slides.filter((_, slideIndex) => slideIndex !== index);
                setDeckSlides(next);
                setOpenIndex(null);
              }}
              onDragStart={() => {
                didDrag.current = true;
                setDragIndex(index);
              }}
              onDragOver={() => setOverIndex(index)}
              onDrop={(fromIndex) => {
                reorder(fromIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
            />
          ))}
        </div>
      )}

      {downloadError ? (
        <div
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-red-300">{downloadError}</p>
          <button
            type="button"
            onClick={() => {
              void download();
            }}
            className="rounded-full border border-red-400/40 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-red-500/20"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={download}
          disabled={downloading || slides.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          style={settings?.accentColor ? { backgroundColor: settings.accentColor } : undefined}
        >
          {downloading ? <Spinner className="h-4 w-4" /> : null}
          {downloading ? "Preparing download…" : "Download .pptx"}
        </button>
        <Link
          href="/customize"
          className="inline-flex items-center justify-center rounded-full border border-[#222222] px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-[#3B82F6] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        >
          Back to Customize
        </Link>
      </div>

      {toast ? (
        <div
          className="toast-in fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-[#111111] px-4 py-3 text-center text-sm text-white shadow-[0_0_28px_rgba(16,185,129,0.2)]"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {openSlide && openIndex !== null ? (
        <SlideModal slide={openSlide} index={openIndex} onClose={() => setOpenIndex(null)} />
      ) : null}
    </div>
  );
}
