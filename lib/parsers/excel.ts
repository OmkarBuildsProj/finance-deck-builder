import { parseSpreadsheet } from "./spreadsheet";
import type { ParsedFile } from "./types";

export function parseExcel(
  fileName: string,
  data: Buffer,
  fileType: "xlsx" | "xls",
): ParsedFile {
  return parseSpreadsheet(fileName, data, fileType);
}
