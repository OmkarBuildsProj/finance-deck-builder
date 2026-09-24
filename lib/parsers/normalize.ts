import type { CellValue, ParsedFile, ParsedSheet, SupportedExtension } from "./types";

const MAX_RAW_TEXT_CHARS = 180_000;

export function cleanText(value: string) {
  return value.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function cellToValue(value: unknown): CellValue {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function isEmptyRow(row: unknown[]) {
  return row.every((cell) => cellToValue(cell) == null);
}

function uniqueHeaders(labels: CellValue[]) {
  const seen = new Map<string, number>();
  return labels.map((label, index) => {
    const base = typeof label === "string" && label.length > 0 ? label : `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

export function matrixToSheet(name: string, matrix: unknown[][]): ParsedSheet | null {
  const content = matrix.filter((row) => Array.isArray(row) && !isEmptyRow(row));
  if (content.length === 0) {
    return null;
  }

  const width = content.reduce((max, row) => Math.max(max, row.length), 0);
  const padded = content.map((row) => {
    const next = row.slice(0, width).map((cell) => cellToValue(cell));
    while (next.length < width) {
      next.push(null);
    }
    return next;
  });

  const usedColumns = Array.from({ length: width }, (_, index) =>
    padded.some((row) => row[index] != null),
  );

  const headerRow = padded[0].filter((_, index) => usedColumns[index]);
  const headers = uniqueHeaders(headerRow);
  const rows = padded.slice(1).map((row) => {
    const record: Record<string, CellValue> = {};
    let headerIndex = 0;
    row.forEach((cell, index) => {
      if (!usedColumns[index]) {
        return;
      }
      record[headers[headerIndex]] = cell;
      headerIndex += 1;
    });
    return record;
  });

  return { name, headers, rows };
}

export function sheetsToRawText(sheets: ParsedSheet[]) {
  const sections = sheets.map((sheet) => {
    const headerLine = sheet.headers.join("\t");
    const rowLines = sheet.rows.map((row) =>
      sheet.headers
        .map((header) => {
          const value = row[header];
          return value == null ? "" : String(value);
        })
        .join("\t"),
    );
    return [`# ${sheet.name}`, headerLine, ...rowLines].filter((line) => line.length > 0).join("\n");
  });

  let text = cleanText(sections.join("\n\n"));
  if (text.length > MAX_RAW_TEXT_CHARS) {
    text = `${text.slice(0, MAX_RAW_TEXT_CHARS).trimEnd()}\n\n[Truncated for analysis. Structured rows above this point are complete.]`;
  }
  return text;
}

export function assembleParsedFile(input: {
  fileName: string;
  fileType: SupportedExtension;
  sheets: ParsedSheet[];
  rawText?: string;
}): ParsedFile {
  const sheets = input.sheets;
  const primary = sheets[0];
  const rawText = cleanText(input.rawText?.trim() ? input.rawText : sheetsToRawText(sheets));

  return {
    fileName: input.fileName,
    fileType: input.fileType,
    sheetNames: sheets.map((sheet) => sheet.name),
    headers: primary?.headers ?? [],
    rows: primary?.rows ?? [],
    sheets,
    rawText,
  };
}
