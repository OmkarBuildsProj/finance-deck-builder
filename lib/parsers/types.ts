export const SUPPORTED_EXTENSIONS = ["xlsx", "xls", "csv", "pdf"] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export type CellValue = string | number | boolean | null;

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: Array<Record<string, CellValue>>;
};

export type ParsedFile = {
  fileName: string;
  fileType: SupportedExtension;
  sheetNames: string[];
  headers: string[];
  rows: Array<Record<string, CellValue>>;
  sheets: ParsedSheet[];
  rawText: string;
};

export type ParseFileInput = {
  fileName: string;
  data: Buffer | Uint8Array;
  mimeType?: string;
};
