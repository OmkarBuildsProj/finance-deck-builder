import * as XLSX from "xlsx";
import { PARSE_MESSAGES, ParseError } from "./errors";
import { assembleParsedFile, matrixToSheet } from "./normalize";
import type { ParsedFile, SupportedExtension } from "./types";

function assertSpreadsheetBytes(data: Buffer, fileType: "xlsx" | "xls" | "csv") {
  if (fileType === "csv") {
    return;
  }

  const isZip = data[0] === 0x50 && data[1] === 0x4b;
  const isOle = data[0] === 0xd0 && data[1] === 0xcf && data[2] === 0x11 && data[3] === 0xe0;

  if (fileType === "xlsx" && !isZip) {
    throw new ParseError("corrupted", PARSE_MESSAGES.corrupted);
  }

  if (fileType === "xls" && !isOle && !isZip) {
    throw new ParseError("corrupted", PARSE_MESSAGES.corrupted);
  }
}

function readWorkbook(data: Buffer, fileType: "xlsx" | "xls" | "csv") {
  assertSpreadsheetBytes(data, fileType);

  try {
    return XLSX.read(data, {
      type: "buffer",
      cellDates: true,
    });
  } catch {
    throw new ParseError("corrupted", PARSE_MESSAGES.corrupted);
  }
}

export function parseSpreadsheet(
  fileName: string,
  data: Buffer,
  fileType: Extract<SupportedExtension, "xlsx" | "xls" | "csv">,
): ParsedFile {
  const workbook = readWorkbook(data, fileType);
  const sheetNames = workbook.SheetNames ?? [];

  if (sheetNames.length === 0) {
    throw new ParseError("empty", PARSE_MESSAGES.noData);
  }

  const sheets = sheetNames.flatMap((name) => {
    const worksheet = workbook.Sheets[name];
    if (!worksheet) {
      return [];
    }

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
      raw: true,
    });

    const sheet = matrixToSheet(name, matrix);
    return sheet ? [sheet] : [];
  });

  if (sheets.length === 0) {
    throw new ParseError("empty", PARSE_MESSAGES.noData);
  }

  return assembleParsedFile({ fileName, fileType, sheets });
}
