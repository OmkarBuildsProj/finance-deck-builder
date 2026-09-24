import { PasswordException, PDFParse } from "pdf-parse";
import { PARSE_MESSAGES, ParseError } from "./errors";
import { assembleParsedFile, cleanText, matrixToSheet } from "./normalize";
import type { ParsedFile, ParsedSheet } from "./types";

function isPasswordError(error: unknown) {
  return error instanceof PasswordException || (error instanceof Error && /password/i.test(error.message));
}

export async function parsePdf(fileName: string, data: Buffer): Promise<ParsedFile> {
  const parser = new PDFParse({ data: new Uint8Array(data) });

  try {
    const textResult = await parser.getText();
    let tables: Awaited<ReturnType<PDFParse["getTable"]>>["pages"] = [];
    try {
      tables = (await parser.getTable()).pages;
    } catch {
      tables = [];
    }

    const rawText = cleanText(textResult.text ?? "").replace(/\n*-- \d+ of \d+ --\n*/g, "\n").trim();
    const sheets: ParsedSheet[] = [];

    for (const page of tables) {
      page.tables.forEach((table, index) => {
        const label =
          page.tables.length === 1 ? `Page ${page.num}` : `Page ${page.num} Table ${index + 1}`;
        const sheet = matrixToSheet(label, table);
        if (sheet) {
          sheets.push(sheet);
        }
      });
    }

    if (sheets.length === 0 && rawText.length === 0) {
      throw new ParseError("empty", PARSE_MESSAGES.noData);
    }

    if (sheets.length === 0) {
      sheets.push({ name: "Document", headers: [], rows: [] });
    }

    return assembleParsedFile({
      fileName,
      fileType: "pdf",
      sheets,
      rawText,
    });
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    if (isPasswordError(error)) {
      throw new ParseError("password", PARSE_MESSAGES.password);
    }
    throw new ParseError("corrupted", PARSE_MESSAGES.corrupted);
  } finally {
    await parser.destroy();
  }
}
