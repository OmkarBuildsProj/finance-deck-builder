import { NextResponse } from "next/server";
import { PARSE_MESSAGES, ParseError, parseFile } from "@/lib/parsers";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;

function errorResponse(error: ParseError) {
  const status =
    error.code === "too_large" ? 413 : error.code === "corrupted" || error.code === "password" ? 422 : 400;

  return NextResponse.json({ error: error.message }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Choose a file to upload before continuing." },
      { status: 400 },
    );
  }

  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) {
    return NextResponse.json(
      { error: "Choose a file to upload before continuing." },
      { status: 400 },
    );
  }

  if (uploaded.size === 0) {
    return errorResponse(new ParseError("empty", PARSE_MESSAGES.empty));
  }

  if (uploaded.size > MAX_FILE_BYTES) {
    return errorResponse(new ParseError("too_large", PARSE_MESSAGES.tooLarge));
  }

  try {
    const data = Buffer.from(await uploaded.arrayBuffer());
    const parsed = await parseFile({
      fileName: uploaded.name,
      mimeType: uploaded.type,
      data,
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof ParseError) {
      return errorResponse(error);
    }

    return errorResponse(new ParseError("corrupted", PARSE_MESSAGES.corrupted));
  }
}
