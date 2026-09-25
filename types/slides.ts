import type { CellValue, ParsedSheet } from "@/lib/parsers/types";

export const SLIDE_TYPES = [
  "title",
  "summary",
  "chart",
  "kpi",
  "table",
  "closing",
] as const;

export type SlideType = (typeof SLIDE_TYPES)[number];

export const CHART_TYPES = ["bar", "line", "pie"] as const;

export type ChartType = (typeof CHART_TYPES)[number];

/** One numeric series. `data` aligns index-for-index with `ChartData.labels`. */
export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ChartData {
  chartType: ChartType;
  labels: string[];
  data: ChartSeries[];
}

export interface Slide {
  type: SlideType;
  title: string;
  /** Prose, or a list of bullet points. Summary slides use exactly three bullets. */
  content: string | string[];
  chartData?: ChartData;
}

export type SlideOutline = Slide[];

export const THEME_IDS = ["corporate", "modern", "light"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Look-and-feel choices from the customize step, sent to `/api/generate`. */
export interface DeckSettings {
  theme: ThemeId;
  /** Hex color, with or without a leading `#`. */
  accentColor: string;
  companyName: string;
  /**
   * Optional logo as a data URL (`data:image/png;base64,...`),
   * a pptxgenjs data string (`image/png;base64,...`), or raw base64.
   */
  logo?: string | null;
}

/** Parsed financial file plus the presentation purpose sent to `/api/analyze`. */
export interface AnalyzeRequest {
  purpose: string;
  headers: string[];
  rows: Array<Record<string, CellValue>>;
  sheets: ParsedSheet[];
  rawText: string;
}
