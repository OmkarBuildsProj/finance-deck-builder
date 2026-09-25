import { NextResponse } from "next/server";
import { generatePresentation } from "@/lib/slides/generator";
import {
  CHART_TYPES,
  SLIDE_TYPES,
  THEME_IDS,
  type ChartData,
  type ChartSeries,
  type ChartType,
  type DeckSettings,
  type Slide,
  type SlideOutline,
  type SlideType,
  type ThemeId,
} from "@/types/slides";

export const runtime = "nodejs";

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const MAX_SLIDES = 40;
const MAX_LOGO_CHARS = 2_800_000;

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSlideType(value: unknown): value is SlideType {
  return typeof value === "string" && (SLIDE_TYPES as readonly string[]).includes(value);
}

function isChartType(value: unknown): value is ChartType {
  return typeof value === "string" && (CHART_TYPES as readonly string[]).includes(value);
}

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

function parseSeries(value: unknown): ChartSeries | string {
  if (!isRecord(value) || typeof value.name !== "string" || !Array.isArray(value.data)) {
    return "Each chart series needs a name and a data array of numbers.";
  }

  if (!value.data.every((point) => typeof point === "number" && Number.isFinite(point))) {
    return "Chart series data must be finite numbers.";
  }

  return { name: value.name, data: value.data };
}

function parseChartData(value: unknown): ChartData | undefined | string {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return "chartData must be an object.";
  if (!isChartType(value.chartType)) return "chartType must be bar, line, or pie.";
  if (!Array.isArray(value.labels) || !value.labels.every((label) => typeof label === "string")) {
    return "Chart labels must be an array of strings.";
  }
  if (!Array.isArray(value.data)) return "Chart data must be an array of series.";

  const series: ChartSeries[] = [];
  for (const item of value.data) {
    const parsed = parseSeries(item);
    if (typeof parsed === "string") return parsed;
    series.push(parsed);
  }

  return { chartType: value.chartType, labels: value.labels, data: series };
}

function parseContent(value: unknown): string | string[] | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  return null;
}

function parseSlide(value: unknown): Slide | string {
  if (!isRecord(value)) return "Each slide must be an object.";
  if (!isSlideType(value.type)) {
    return "Slide type must be title, summary, chart, kpi, table, or closing.";
  }
  if (typeof value.title !== "string") return "Each slide needs a title.";

  const content = parseContent(value.content);
  if (content === null) return "Slide content must be a string or an array of strings.";

  const chartData = parseChartData(value.chartData);
  if (typeof chartData === "string") return chartData;

  return {
    type: value.type,
    title: value.title,
    content,
    ...(chartData ? { chartData } : {}),
  };
}

function parseSlides(value: unknown): SlideOutline | string {
  if (!Array.isArray(value) || value.length === 0) {
    return "Provide a non-empty slides array.";
  }
  if (value.length > MAX_SLIDES) {
    return `A deck can include at most ${MAX_SLIDES} slides.`;
  }

  const slides: Slide[] = [];
  for (const item of value) {
    const parsed = parseSlide(item);
    if (typeof parsed === "string") return parsed;
    slides.push(parsed);
  }
  return slides;
}

function parseSettings(body: Record<string, unknown>): DeckSettings | string {
  const source = isRecord(body.settings) ? body.settings : body;
  if (!isThemeId(source.theme)) {
    return "Theme must be corporate, modern, or light.";
  }
  if (typeof source.accentColor !== "string" || !/^#?[0-9a-fA-F]{6}$/.test(source.accentColor.trim())) {
    return "Accent color must be a 6-digit hex value.";
  }
  if (typeof source.companyName !== "string") {
    return "Company name must be a string.";
  }

  let logo: string | null = null;
  if (source.logo !== undefined && source.logo !== null) {
    if (typeof source.logo !== "string") return "Logo must be a base64 image string.";
    if (source.logo.length > MAX_LOGO_CHARS) return "Logo image is too large.";
    logo = source.logo;
  }

  return {
    theme: source.theme,
    accentColor: source.accentColor,
    companyName: source.companyName,
    logo,
  };
}

function fileName(companyName: string) {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "presentation"}.pptx`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be valid JSON.", 400);
  }

  if (!isRecord(body)) {
    return errorJson("Request body must be a JSON object.", 400);
  }

  const slides = parseSlides(body.slides);
  if (typeof slides === "string") return errorJson(slides, 400);

  const settings = parseSettings(body);
  if (typeof settings === "string") return errorJson(settings, 400);

  try {
    const file = await generatePresentation(slides, settings);
    return new NextResponse(Buffer.from(file), {
      status: 200,
      headers: {
        "Content-Type": PPTX_MIME,
        "Content-Disposition": `attachment; filename="${fileName(settings.companyName)}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate the presentation.";
    const status = /accent color|logo/i.test(message) ? 400 : 500;
    return errorJson(message, status);
  }
}
