import { PARSE_MESSAGES, ParseError } from "./errors";
import { parseCsv } from "./csv";
import { parseExcel } from "./excel";
import { parsePdf } from "./pdf";
import { SUPPORTED_EXTENSIONS, type ParseFileInput, type ParsedFile, type SupportedExtension } from "./types";

const MIME_TYPES: Record<string, SupportedExtension> = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/csv": "csv",
  "application/csv": "csv",
  "text/comma-separated-values": "csv",
  "application/pdf": "pdf",
};

export function detectFileType(fileName: string, mimeType?: string): SupportedExtension {
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";

  if ((SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)) {
    return extension as SupportedExtension;
  }

  const fromMime = mimeType ? MIME_TYPES[mimeType.toLowerCase()] : undefined;
  if (fromMime) {
    return fromMime;
  }

  throw new ParseError("unsupported", PARSE_MESSAGES.unsupported);
}

export async function parseFile(input: ParseFileInput): Promise<ParsedFile> {
  const fileName = input.fileName.trim();
  if (!fileName) {
    throw new ParseError("unsupported", PARSE_MESSAGES.unsupported);
  }

  const data = Buffer.isBuffer(input.data) ? input.data : Buffer.from(input.data);
  if (data.length === 0) {
    throw new ParseError("empty", PARSE_MESSAGES.empty);
  }

  const fileType = detectFileType(fileName, input.mimeType);

  switch (fileType) {
    case "xlsx":
    case "xls":
      return parseExcel(fileName, data, fileType);
    case "csv":
      return parseCsv(fileName, data);
    case "pdf":
      return parsePdf(fileName, data);
  }
}

export { PARSE_MESSAGES, ParseError } from "./errors";
export { parseCsv } from "./csv";
export { parseExcel } from "./excel";
export { parsePdf } from "./pdf";
export type { CellValue, ParsedFile, ParsedSheet, ParseFileInput, SupportedExtension } from "./types";
