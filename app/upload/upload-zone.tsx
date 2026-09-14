"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".pdf", ".pptx"] as const;
const ACCEPT = ACCEPTED_EXTENSIONS.join(",");

const ACCEPTED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const ERROR_MESSAGE =
  "Unsupported file type. Please upload an Excel, CSV, PDF, or PowerPoint file.";

type AcceptedFile = {
  file: File;
  name: string;
  sizeLabel: string;
  extension: string;
};

function getExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function isAcceptedFile(file: File) {
  const extension = getExtension(file.name);
  if (ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return true;
  }
  return ACCEPTED_MIME_TYPES.has(file.type);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes < 10 ? kilobytes.toFixed(1) : Math.round(kilobytes)} KB`;
  }

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

function FileTypeIcon({ extension }: { extension: string }) {
  const label = extension.replace(".", "").toUpperCase() || "FILE";

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6]"
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function UploadZone() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [accepted, setAccepted] = useState<AcceptedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    if (!isAcceptedFile(file)) {
      setAccepted(null);
      setError(ERROR_MESSAGE);
      resetInput();
      return;
    }

    setError(null);
    setAccepted({
      file,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      extension: getExtension(file.name),
    });
  }, []);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCount.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCount.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCount.current -= 1;
    if (dragCount.current <= 0) {
      dragCount.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const removeFile = () => {
    setAccepted(null);
    setError(null);
    resetInput();
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onChange={onInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload financial data file"
        aria-describedby={error ? `${inputId}-error` : undefined}
        onClick={() => {
          if (!accepted) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (!accepted && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-all duration-300 ease-out ${
          isDragging
            ? "border-[#3B82F6] bg-[#3B82F6]/10"
            : accepted
              ? "cursor-default border-[#222222] bg-[#111111]"
              : "cursor-pointer border-[#222222] bg-transparent hover:border-[#333333] hover:bg-white/[0.02]"
        }`}
      >
        {accepted ? (
          <div className="flex w-full max-w-md items-center gap-4 text-left">
            <FileTypeIcon extension={accepted.extension} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-white">
                {accepted.name}
              </p>
              <p className="mt-1 text-sm text-gray-400">{accepted.sizeLabel}</p>
            </div>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
              aria-label="File accepted"
            >
              <CheckIcon />
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                removeFile();
              }}
              className="text-sm text-gray-400 transition-colors duration-300 hover:text-white"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="text-gray-400">
              <UploadIcon />
            </div>
            <p className="mt-6 text-lg font-medium text-white">
              Drag & drop your file here
            </p>
            <p className="mt-2 text-sm text-gray-400">or click to browse</p>
          </>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-4 text-center text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col items-center">
        <button
          type="button"
          disabled={!accepted}
          className="rounded-full bg-[#3B82F6] px-8 py-3 text-sm font-medium text-white transition-all duration-300 ease-out enabled:hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
        <p className="mt-6 text-sm text-gray-500">
          Supported formats: .xlsx, .xls, .csv, .pdf, .pptx
        </p>
      </div>
    </div>
  );
}
