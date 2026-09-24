import { parseSpreadsheet } from "./spreadsheet";
import type { ParsedFile } from "./types";

export function parseCsv(fileName: string, data: Buffer): ParsedFile {
  return parseSpreadsheet(fileName, data, "csv");
}
