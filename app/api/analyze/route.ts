import Anthropic, {
  APIConnectionError,
  APIError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { NextResponse } from "next/server";
import type { CellValue, ParsedSheet } from "@/lib/parsers/types";
import type { AnalyzeRequest, SlideOutline } from "@/types/slides";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-5";
const MAX_SHEETS = 8;
const MAX_ROWS_PER_SHEET = 150;
const MAX_RAW_TEXT_CHARS = 24_000;

const slideOutlineSchema = {
  type: "object",
  additionalProperties: false,
  required: ["slides"],
  properties: {
    slides: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "content"],
        properties: {
          type: {
            type: "string",
            enum: ["title", "summary", "chart", "kpi", "table", "closing"],
          },
          title: { type: "string" },
          content: {
            anyOf: [
              { type: "string" },
              { type: "array", items: { type: "string" } },
            ],
          },
          chartData: {
            type: "object",
            additionalProperties: false,
            required: ["chartType", "labels", "data"],
            properties: {
              chartType: { type: "string", enum: ["bar", "line", "pie"] },
              labels: { type: "array", items: { type: "string" } },
              data: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name", "data"],
                  properties: {
                    name: { type: "string" },
                    data: { type: "array", items: { type: "number" } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = `You are a financial presentation analyst. Analyze the supplied financial data for the stated presentation purpose.

Do this before you write slides:
- Identify the key metrics, comparisons, and trends that matter for the purpose.
- Choose a chart type for each quantitative data set: "line" for change over time, "bar" for category comparisons, "pie" for composition or share of a whole.
- Write an executive summary that contains exactly 3 key takeaways grounded in the numbers.

Return a deck as the "slides" array. Order it as:
1. One "title" slide.
2. One "summary" slide whose content is an array of exactly 3 takeaway bullets.
3. Supporting "kpi", "chart", and "table" slides as the data warrants.
4. One "closing" slide.

Rules:
- Use only figures present in the data. Do not invent metrics, periods, or entities.
- "content" is either a string of prose or an array of bullet strings.
- Include "chartData" on every "chart" slide. "chartType" is "bar", "line", or "pie". "labels" are the categories. "data" is an array of series, and each series "data" array aligns with "labels".
- Omit "chartData" on slides that are not charts.
- Keep titles short and specific. Prefer a tight deck over padding.`;

function errorJson(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCellValue(value: unknown): value is CellValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isRow(value: unknown): value is Record<string, CellValue> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(isCellValue);
}

function isSheet(value: unknown): value is ParsedSheet {
  if (!isRecord(value) || typeof value.name !== "string" || !Array.isArray(value.headers)) {
    return false;
  }

  if (!value.headers.every((header) => typeof header === "string")) {
    return false;
  }

  return Array.isArray(value.rows) && value.rows.every(isRow);
}

function parseRequest(body: unknown): AnalyzeRequest | string {
  if (!isRecord(body)) {
    return "Request body must be a JSON object.";
  }

  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  if (!purpose) {
    return "Provide a presentation purpose.";
  }

  if (!Array.isArray(body.headers) || !body.headers.every((header) => typeof header === "string")) {
    return "Financial data must include a headers array of strings.";
  }

  if (!Array.isArray(body.rows) || !body.rows.every(isRow)) {
    return "Financial data must include a rows array of cell objects.";
  }

  if (!Array.isArray(body.sheets) || !body.sheets.every(isSheet)) {
    return "Financial data must include a sheets array.";
  }

  if (typeof body.rawText !== "string") {
    return "Financial data must include rawText.";
  }

  return {
    purpose,
    headers: body.headers,
    rows: body.rows,
    sheets: body.sheets,
    rawText: body.rawText,
  };
}

function limitSheet(sheet: ParsedSheet) {
  const truncated = sheet.rows.length > MAX_ROWS_PER_SHEET;
  return {
    name: sheet.name,
    headers: sheet.headers,
    rows: truncated ? sheet.rows.slice(0, MAX_ROWS_PER_SHEET) : sheet.rows,
    truncated,
    totalRows: sheet.rows.length,
  };
}

function buildUserPrompt(input: AnalyzeRequest) {
  const sheets = input.sheets.slice(0, MAX_SHEETS).map(limitSheet);
  const rawText =
    input.rawText.length > MAX_RAW_TEXT_CHARS
      ? `${input.rawText.slice(0, MAX_RAW_TEXT_CHARS)}\n\n[rawText truncated]`
      : input.rawText;

  const payload = {
    purpose: input.purpose,
    headers: input.headers,
    rows: input.rows.slice(0, MAX_ROWS_PER_SHEET),
    rowsTruncated: input.rows.length > MAX_ROWS_PER_SHEET,
    totalRows: input.rows.length,
    sheets,
    sheetsTruncated: input.sheets.length > MAX_SHEETS,
    rawText,
  };

  return `Presentation purpose:\n${input.purpose}\n\nFinancial data (JSON):\n${JSON.stringify(payload)}`;
}

function retryAfterSeconds(headers: Headers | undefined) {
  const value = headers?.get("retry-after");
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorJson("ANTHROPIC_API_KEY is not set. Add it to .env.local.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be valid JSON.", 400);
  }

  const parsed = parseRequest(body);
  if (typeof parsed === "string") {
    return errorJson(parsed, 400);
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(parsed) }],
      output_config: {
        format: jsonSchemaOutputFormat(slideOutlineSchema),
      },
    });

    if (message.stop_reason === "refusal") {
      return errorJson("The model declined to analyze this data.", 422);
    }

    if (message.stop_reason === "max_tokens" || !message.parsed_output) {
      return errorJson("The slide outline was incomplete. Try again with a smaller file.", 502);
    }

    const slides: SlideOutline = message.parsed_output.slides;
    return NextResponse.json(slides);
  } catch (error) {
    if (error instanceof RateLimitError) {
      const retryAfter = retryAfterSeconds(error.headers);
      return errorJson(
        "Anthropic rate limit reached. Wait and try again.",
        429,
        retryAfter === undefined ? undefined : { retryAfter },
      );
    }

    if (error instanceof APIConnectionError) {
      return errorJson("Could not reach the Anthropic API.", 502);
    }

    if (error instanceof APIError) {
      const status = error.status === 401 || error.status === 403 ? error.status : 502;
      const message =
        error.status === 401 || error.status === 403
          ? "Anthropic rejected the API key."
          : "The Anthropic API request failed.";
      return errorJson(message, status);
    }

    return errorJson("Failed to build a slide outline.", 500);
  }
}
