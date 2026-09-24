export type ParseErrorCode =
  | "unsupported"
  | "empty"
  | "corrupted"
  | "password"
  | "too_large";

export class ParseError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message: string) {
    super(message);
    this.name = "ParseError";
    this.code = code;
  }
}

export const PARSE_MESSAGES = {
  unsupported:
    "This file type isn't supported. Upload an Excel (.xlsx, .xls), CSV, or PDF file.",
  empty: "This file is empty. Upload a file that contains financial data.",
  noData:
    "This file doesn't contain any readable data. Check that it includes tables or text, then try again.",
  corrupted:
    "We couldn't read this file. It may be corrupted or incomplete. Export it again and re-upload.",
  password:
    "This PDF is password-protected. Remove the password and upload it again.",
  tooLarge: "This file is too large. Upload a file smaller than 20 MB.",
} as const;
