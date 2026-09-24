export type UploadedFileData = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

const STORAGE_KEY = "deckflow-uploaded-file";

let uploadedFile: File | null = null;
let uploadedFileData: UploadedFileData | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeUploadedFile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStoredData(): UploadedFileData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UploadedFileData;
  } catch {
    return null;
  }
}

export function setUploadedFile(file: File) {
  uploadedFile = file;
  uploadedFileData = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedFileData));
  }

  emit();
}

export function getUploadedFile(): File | null {
  return uploadedFile;
}

export function getUploadedFileData(): UploadedFileData | null {
  if (uploadedFileData) {
    return uploadedFileData;
  }

  uploadedFileData = readStoredData();
  return uploadedFileData;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes < 10 ? kilobytes.toFixed(1) : Math.round(kilobytes)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}
