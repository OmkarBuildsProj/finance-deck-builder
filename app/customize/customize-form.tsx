"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import {
  formatFileSize,
  getUploadedFile,
  getUploadedFileData,
  subscribeUploadedFile,
} from "../lib/upload-session";

type ThemeId = "corporate" | "modern" | "light";

const ACCENT_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Teal", value: "#14B8A6" },
] as const;

const THEMES: {
  id: ThemeId;
  name: string;
  description: string;
}[] = [
  {
    id: "corporate",
    name: "Corporate",
    description: "Navy and white. Formal, boardroom-ready.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Dark canvas with vivid accent color.",
  },
  {
    id: "light",
    name: "Light",
    description: "Soft whites and grays. High readability.",
  },
];

function ThemePreview({
  theme,
  accentColor,
}: {
  theme: ThemeId;
  accentColor: string;
}) {
  if (theme === "corporate") {
    return (
      <div className="overflow-hidden rounded-lg bg-white">
        <div className="h-8 bg-[#0B1F3A]" />
        <div className="space-y-1.5 p-3">
          <div className="h-1.5 w-2/3 rounded-full bg-[#0B1F3A]" />
          <div className="h-1 w-full rounded-full bg-neutral-200" />
          <div className="h-1 w-5/6 rounded-full bg-neutral-200" />
          <div className="mt-2 flex gap-1.5">
            <div className="h-6 flex-1 rounded-sm bg-[#0B1F3A]/10" />
            <div className="h-6 flex-1 rounded-sm bg-[#0B1F3A]/10" />
          </div>
        </div>
      </div>
    );
  }

  if (theme === "modern") {
    return (
      <div className="overflow-hidden rounded-lg bg-[#0A0A0A]">
        <div className="flex h-8 items-end px-3 pb-2">
          <div
            className="h-1 w-10 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        <div className="space-y-1.5 p-3 pt-0">
          <div className="h-1.5 w-1/2 rounded-full bg-white/80" />
          <div className="h-1 w-full rounded-full bg-white/15" />
          <div className="h-1 w-4/5 rounded-full bg-white/10" />
          <div className="mt-2 flex gap-1.5">
            <div
              className="h-6 flex-1 rounded-sm opacity-80"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-6 flex-1 rounded-sm bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-[#F5F5F7]">
      <div className="h-8 bg-white" />
      <div className="space-y-1.5 p-3">
        <div className="h-1.5 w-3/5 rounded-full bg-neutral-400" />
        <div className="h-1 w-full rounded-full bg-neutral-300" />
        <div className="h-1 w-2/3 rounded-full bg-neutral-300" />
        <div className="mt-2 flex gap-1.5">
          <div className="h-6 flex-1 rounded-sm bg-white" />
          <div className="h-6 flex-1 rounded-sm bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export function CustomizeForm() {
  const logoInputId = useId();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoPreviewUrl = useRef<string | null>(null);

  const uploadedFile = useSyncExternalStore(
    subscribeUploadedFile,
    getUploadedFile,
    () => null,
  );
  const uploadedFileData = useSyncExternalStore(
    subscribeUploadedFile,
    getUploadedFileData,
    () => null,
  );
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId>("corporate");
  const [accentColor, setAccentColor] = useState<string>("#3B82F6");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.current) {
        URL.revokeObjectURL(logoPreviewUrl.current);
      }
    };
  }, []);

  const onLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (logoPreviewUrl.current) {
      URL.revokeObjectURL(logoPreviewUrl.current);
    }

    const nextUrl = URL.createObjectURL(file);
    logoPreviewUrl.current = nextUrl;
    setLogoFile(file);
    setLogoPreview(nextUrl);
  };

  const removeLogo = () => {
    if (logoPreviewUrl.current) {
      URL.revokeObjectURL(logoPreviewUrl.current);
      logoPreviewUrl.current = null;
    }
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const fileLabel = uploadedFile?.name ?? uploadedFileData?.name;
  const fileSizeLabel = uploadedFile
    ? formatFileSize(uploadedFile.size)
    : uploadedFileData
      ? formatFileSize(uploadedFileData.size)
      : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-white"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </Link>

      <div className="mt-10">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Customize Your Deck
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Set the look and purpose. We will use these details when generating
          your slides.
        </p>
      </div>

      {fileLabel ? (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#222222] bg-[#111111] px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6]">
            FILE
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{fileLabel}</p>
            {fileSizeLabel ? (
              <p className="text-xs text-gray-500">{fileSizeLabel}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-gray-500">
          No file received from the upload step.{" "}
          <Link href="/upload" className="text-gray-300 underline-offset-4 hover:underline">
            Go back to upload
          </Link>
          .
        </p>
      )}

      <form
        className="mt-10 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <section className="rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
          <label
            htmlFor="company-name"
            className="text-sm font-medium text-white"
          >
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Acme Capital"
            className="mt-3 w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors duration-300 focus:border-[#3B82F6]"
          />
        </section>

        <section className="rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
          <p className="text-sm font-medium text-white">Logo</p>
          <p className="mt-1 text-sm text-gray-500">
            Optional. Square images work best.
          </p>

          <input
            ref={logoInputRef}
            id={logoInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onLogoChange}
          />

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#222222] bg-[#0A0A0A] transition-colors duration-300 hover:border-[#333333]"
              aria-label={logoPreview ? "Change logo" : "Upload logo"}
            >
              {logoPreview ? (
                <span
                  role="img"
                  aria-label={logoFile?.name ?? "Logo preview"}
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${logoPreview})` }}
                />
              ) : (
                <span className="text-xs text-gray-500">Upload</span>
              )}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-400">
                {logoFile ? logoFile.name : "PNG, JPG, or SVG"}
              </p>
              {logoFile ? (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="mt-2 text-sm text-gray-500 transition-colors duration-300 hover:text-white"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
          <p className="text-sm font-medium text-white">Theme</p>
          <p className="mt-1 text-sm text-gray-500">
            Choose the visual system for your slides.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {THEMES.map((item) => {
              const selected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  aria-pressed={selected}
                  className={`rounded-2xl border p-3 text-left transition-all duration-300 ${
                    selected
                      ? "border-[#3B82F6]"
                      : "border-[#222222] hover:border-[#333333]"
                  }`}
                >
                  <ThemePreview theme={item.id} accentColor={accentColor} />
                  <p className="mt-3 text-sm font-medium text-white">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
          <p className="text-sm font-medium text-white">Accent Color</p>
          <p className="mt-1 text-sm text-gray-500">
            Used for highlights and the generate button.
          </p>
          <div className="mt-5 flex flex-wrap gap-4" role="radiogroup" aria-label="Accent color">
            {ACCENT_COLORS.map((color) => {
              const selected = accentColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color.name}
                  onClick={() => setAccentColor(color.value)}
                  className={`h-8 w-8 rounded-full transition-transform duration-300 ${
                    selected
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#111111]"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
          <label htmlFor="purpose" className="text-sm font-medium text-white">
            Presentation Purpose
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Describe what this deck is for.
          </p>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={5}
            placeholder="Q3 board update covering revenue, margins, and outlook."
            className="mt-3 w-full resize-none rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-gray-600 outline-none transition-colors duration-300 focus:border-[#3B82F6]"
          />
        </section>

        <button
          type="submit"
          className="w-full rounded-full px-8 py-4 text-base font-medium text-white transition-opacity duration-300 hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Generate Presentation
        </button>
      </form>
    </div>
  );
}
