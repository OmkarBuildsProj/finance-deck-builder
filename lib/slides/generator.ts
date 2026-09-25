import PptxGenJS from "pptxgenjs";
import type {
  ChartData,
  ChartSeries,
  ChartType,
  DeckSettings,
  Slide,
  SlideOutline,
  ThemeId,
} from "@/types/slides";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN_X = 0.55;
const CONTENT_W = SLIDE_W - MARGIN_X * 2;
const FOOTER_Y = 7.08;

const UP_COLOR = "22C55E";
const DOWN_COLOR = "EF4444";

type Rgb = { r: number; g: number; b: number };

interface ThemePreset {
  id: ThemeId;
  background: string;
  text: string;
  muted: string;
  card: string;
  altRow: string;
  fontFace: string;
  grid: string;
}

const THEME_PRESETS: Record<ThemeId, ThemePreset> = {
  corporate: {
    id: "corporate",
    background: "1E3A5F",
    text: "FFFFFF",
    muted: "C5D0DC",
    card: "16324F",
    altRow: "25466C",
    fontFace: "Georgia",
    grid: "3D5A80",
  },
  modern: {
    id: "modern",
    background: "0A0A0A",
    text: "FFFFFF",
    muted: "A1A1AA",
    card: "171717",
    altRow: "141414",
    fontFace: "Arial",
    grid: "2A2A2A",
  },
  light: {
    id: "light",
    background: "F8F9FA",
    text: "1A1A1A",
    muted: "5C6570",
    card: "FFFFFF",
    altRow: "EEF1F4",
    fontFace: "Calibri",
    grid: "D5DCE3",
  },
};

interface ResolvedSettings {
  theme: ThemePreset;
  accent: string;
  companyName: string;
  logoData: string | null;
}

interface KpiCallout {
  label: string;
  value: string;
  direction: "up" | "down" | null;
}

export async function generatePresentation(
  slides: SlideOutline,
  settings: DeckSettings,
): Promise<Uint8Array> {
  const resolved = resolveSettings(settings);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = resolved.companyName || "DeckFlow";
  pptx.title = slides.find((slide) => slide.type === "title")?.title || "Presentation";
  pptx.subject = "Financial presentation";

  defineMaster(pptx, resolved);

  const deck = slides.length > 0 ? slides : [fallbackSlide()];
  deck.forEach((slide) => {
    renderSlide(pptx, slide, resolved);
  });

  const output = await pptx.write({ outputType: "nodebuffer" });
  return toBytes(output);
}

function fallbackSlide(): Slide {
  return {
    type: "title",
    title: "Presentation",
    content: "",
  };
}

function resolveSettings(settings: DeckSettings): ResolvedSettings {
  return {
    theme: THEME_PRESETS[settings.theme],
    accent: normalizeHex(settings.accentColor),
    companyName: settings.companyName.trim(),
    logoData: normalizeLogo(settings.logo),
  };
}

function defineMaster(pptx: PptxGenJS, settings: ResolvedSettings) {
  const { theme, accent, companyName } = settings;
  pptx.defineSlideMaster({
    title: theme.id,
    background: { color: theme.background },
    slideNumber: {
      x: SLIDE_W - MARGIN_X - 0.7,
      y: FOOTER_Y,
      w: 0.7,
      h: 0.28,
      color: theme.muted,
      fontFace: theme.fontFace,
      fontSize: 11,
      align: "right",
    },
    objects: [
      {
        rect: {
          x: MARGIN_X,
          y: 6.96,
          w: CONTENT_W,
          h: 0.015,
          fill: { color: accent },
        },
      },
      {
        text: {
          text: companyName,
          options: {
            x: MARGIN_X,
            y: FOOTER_Y,
            w: 8,
            h: 0.28,
            fontFace: theme.fontFace,
            fontSize: 11,
            color: theme.muted,
            margin: 0,
          },
        },
      },
    ],
  });
}

function renderSlide(pptx: PptxGenJS, slide: Slide, settings: ResolvedSettings) {
  const page = pptx.addSlide({ masterName: settings.theme.id });
  page.slideNumber = {
    x: SLIDE_W - MARGIN_X - 0.7,
    y: FOOTER_Y,
    w: 0.7,
    h: 0.28,
    color: settings.theme.muted,
    fontFace: settings.theme.fontFace,
    fontSize: 11,
    align: "right",
  };

  switch (slide.type) {
    case "title":
      renderTitle(page, pptx, slide, settings);
      break;
    case "summary":
      renderSummary(page, slide, settings, "Executive Summary");
      break;
    case "chart":
      renderChart(page, pptx, slide, settings);
      break;
    case "kpi":
      renderKpi(page, pptx, slide, settings);
      break;
    case "table":
      renderTable(page, slide, settings);
      break;
    case "closing":
      renderSummary(page, slide, settings, "Next Steps");
      break;
    default:
      renderSummary(page, slide, settings, "Overview");
  }
}

function renderTitle(
  page: PptxGenJS.Slide,
  pptx: PptxGenJS,
  slide: Slide,
  settings: ResolvedSettings,
) {
  const { theme, accent, companyName, logoData } = settings;
  const subtitle = prose(slide.content);

  page.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.14,
    h: SLIDE_H,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });

  if (logoData) {
    page.addImage({
      data: logoData,
      x: SLIDE_W - MARGIN_X - 1.15,
      y: 0.42,
      w: 1.15,
      h: 1.15,
    });
  }

  if (companyName) {
    page.addText(companyName, {
      x: MARGIN_X + 0.15,
      y: 1.55,
      w: CONTENT_W - 1.6,
      h: 0.38,
      fontFace: theme.fontFace,
      fontSize: 16,
      color: accent,
      margin: 0,
    });
  }

  page.addText(slide.title || "Presentation", {
    x: MARGIN_X + 0.15,
    y: companyName ? 2.05 : 2.2,
    w: CONTENT_W - 0.4,
    h: 1.7,
    fontFace: theme.fontFace,
    fontSize: 40,
    bold: theme.id !== "corporate",
    color: theme.text,
    margin: 0,
    valign: "top",
  });

  page.addShape(pptx.ShapeType.rect, {
    x: MARGIN_X + 0.15,
    y: 4.05,
    w: 1.6,
    h: 0.06,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });

  page.addText(formatDate(new Date()), {
    x: MARGIN_X + 0.15,
    y: 4.28,
    w: 6,
    h: 0.36,
    fontFace: theme.fontFace,
    fontSize: 16,
    color: theme.muted,
    margin: 0,
  });

  if (subtitle) {
    page.addText(subtitle, {
      x: MARGIN_X + 0.15,
      y: 4.8,
      w: 9.5,
      h: 1.4,
      fontFace: theme.fontFace,
      fontSize: 18,
      color: theme.muted,
      margin: 0,
    });
  }
}

function renderSummary(
  page: PptxGenJS.Slide,
  slide: Slide,
  settings: ResolvedSettings,
  eyebrow: string,
) {
  const { theme, accent } = settings;
  addHeading(page, slide.title || eyebrow, eyebrow, settings);

  const bullets = asBullets(slide.content);
  const items = bullets.length > 0 ? bullets : ["No summary provided."];
  const top = 1.85;
  const gap = 0.16;
  const available = 4.9;
  const height = Math.min(1.15, (available - gap * (items.length - 1)) / items.length);

  items.forEach((bullet, index) => {
    const y = top + index * (height + gap);
    page.addShape("rect", {
      x: MARGIN_X,
      y,
      w: 0.08,
      h: height,
      fill: { color: accent },
      line: { color: accent, width: 0 },
    });
    page.addText(bullet, {
      x: MARGIN_X + 0.28,
      y,
      w: CONTENT_W - 0.28,
      h: height,
      fontFace: theme.fontFace,
      fontSize: items.length > 5 ? 16 : 20,
      color: theme.text,
      margin: 0,
      valign: "middle",
    });
  });
}

function renderChart(
  page: PptxGenJS.Slide,
  pptx: PptxGenJS,
  slide: Slide,
  settings: ResolvedSettings,
) {
  const { theme, accent } = settings;
  addHeading(page, slide.title || "Chart", "Performance", settings);

  const series = chartSeries(slide.chartData);
  const note = asBullets(slide.content).slice(0, 3);
  const chartW = note.length > 0 ? 8.35 : CONTENT_W;
  const chartType = slide.chartData?.chartType ?? "bar";

  if (!series) {
    page.addText("This chart slide did not include plottable data.", {
      x: MARGIN_X,
      y: 2.4,
      w: CONTENT_W,
      h: 0.5,
      fontFace: theme.fontFace,
      fontSize: 18,
      color: theme.muted,
    });
    return;
  }

  page.addChart(pptxChartType(pptx, chartType), series, {
    x: MARGIN_X,
    y: 1.7,
    w: chartW,
    h: 4.95,
    showLegend: series.length > 1 || chartType === "pie",
    legendPos: "b",
    legendColor: theme.text,
    legendFontFace: theme.fontFace,
    legendFontSize: 11,
    chartColors: chartPalette(accent),
    showPercent: chartType === "pie",
    showValue: false,
    showTitle: false,
    barGrouping: "clustered",
    catAxisLabelColor: theme.muted,
    valAxisLabelColor: theme.muted,
    catAxisLabelFontFace: theme.fontFace,
    valAxisLabelFontFace: theme.fontFace,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 11,
    catAxisLineColor: theme.grid,
    valAxisLineColor: theme.grid,
    valGridLine: chartType === "pie" ? { style: "none" } : { color: theme.grid, size: 0.5 },
    chartArea: { fill: { color: theme.card } },
    plotArea: { fill: { color: theme.card } },
    lineDataSymbol: "circle",
    lineDataSymbolSize: 12,
  });

  if (note.length > 0) {
    const panelX = MARGIN_X + chartW + 0.28;
    page.addShape("rect", {
      x: panelX,
      y: 1.7,
      w: 0.06,
      h: 4.95,
      fill: { color: accent },
      line: { color: accent, width: 0 },
    });
    note.forEach((item, index) => {
      page.addText(item, {
        x: panelX + 0.22,
        y: 1.85 + index * 1.5,
        w: SLIDE_W - MARGIN_X - panelX - 0.22,
        h: 1.35,
        fontFace: theme.fontFace,
        fontSize: 14,
        color: theme.text,
        margin: 0,
        valign: "top",
      });
    });
  }
}

function renderKpi(
  page: PptxGenJS.Slide,
  pptx: PptxGenJS,
  slide: Slide,
  settings: ResolvedSettings,
) {
  const { theme, accent } = settings;
  addHeading(page, slide.title || "Key Metrics", "Key Metrics", settings);

  const callouts = kpiCallouts(slide);
  const count = callouts.length;
  const columns = count <= 1 ? 1 : count === 2 || count === 4 ? 2 : 3;
  const rows = Math.ceil(count / columns);
  const gap = 0.22;
  const cardW = (CONTENT_W - gap * (columns - 1)) / columns;
  const cardH = Math.min(2.15, (4.9 - gap * (rows - 1)) / rows);
  const originY = 1.8;

  callouts.forEach((callout, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = MARGIN_X + col * (cardW + gap);
    const y = originY + row * (cardH + gap);
    const arrowColor = callout.direction === "down" ? DOWN_COLOR : UP_COLOR;

    page.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: theme.card },
      line: { color: accent, width: 1.25 },
      rectRadius: 0.08,
    });
    page.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w: cardW,
      h: 0.08,
      fill: { color: accent },
      line: { color: accent, width: 0 },
    });

    page.addText(callout.label, {
      x: x + 0.22,
      y: y + 0.24,
      w: cardW - 0.44,
      h: 0.36,
      fontFace: theme.fontFace,
      fontSize: 13,
      color: theme.muted,
      margin: 0,
    });

    const valueW = callout.direction ? cardW - 1.15 : cardW - 0.44;
    page.addText(callout.value, {
      x: x + 0.22,
      y: y + 0.64,
      w: valueW,
      h: cardH - 0.9,
      fontFace: theme.fontFace,
      fontSize: cardH > 1.6 ? 32 : 26,
      bold: true,
      color: theme.text,
      margin: 0,
      valign: "middle",
    });

    if (callout.direction) {
      page.addText(callout.direction === "up" ? "▲" : "▼", {
        x: x + cardW - 0.78,
        y: y + 0.7,
        w: 0.52,
        h: cardH - 1,
        fontFace: "Arial",
        fontSize: 28,
        color: arrowColor,
        align: "right",
        valign: "middle",
        margin: 0,
      });
    }
  });
}

function renderTable(page: PptxGenJS.Slide, slide: Slide, settings: ResolvedSettings) {
  const { theme, accent } = settings;
  addHeading(page, slide.title || "Details", "Detail", settings);

  const matrix = tableMatrix(slide);
  const columns = Math.max(...matrix.map((row) => row.length), 1);
  const colW = Array.from({ length: columns }, () => CONTENT_W / columns);
  const headerText = contrastText(accent);
  const border = {
    pt: 0.6,
    color: accent,
  } as const;

  const rows: PptxGenJS.TableRow[] = matrix.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const fill = isHeader ? accent : rowIndex % 2 === 0 ? theme.altRow : theme.card;
    const color = isHeader ? headerText : theme.text;
    const cells = Array.from({ length: columns }, (_, colIndex) => row[colIndex] ?? "");

    return cells.map((cell) => ({
      text: cell,
      options: {
        fill: { color: fill },
        color,
        bold: isHeader,
        align: "left" as const,
        valign: "middle" as const,
        fontFace: theme.fontFace,
        fontSize: matrix.length > 12 ? 11 : 13,
        margin: [6, 8, 6, 8] as [number, number, number, number],
        border: [border, border, border, border],
      },
    }));
  });

  page.addTable(rows, {
    x: MARGIN_X,
    y: 1.7,
    w: CONTENT_W,
    colW,
    fontFace: theme.fontFace,
    color: theme.text,
    border: [border, border, border, border],
    valign: "middle",
  });
}

function addHeading(
  page: PptxGenJS.Slide,
  title: string,
  eyebrow: string,
  settings: ResolvedSettings,
) {
  const { theme, accent } = settings;
  page.addText(eyebrow.toUpperCase(), {
    x: MARGIN_X,
    y: 0.32,
    w: CONTENT_W,
    h: 0.28,
    fontFace: theme.fontFace,
    fontSize: 12,
    color: accent,
    margin: 0,
    charSpacing: 1.4,
  });
  page.addText(title, {
    x: MARGIN_X,
    y: 0.62,
    w: CONTENT_W,
    h: 0.62,
    fontFace: theme.fontFace,
    fontSize: 28,
    bold: theme.id !== "corporate",
    color: theme.text,
    margin: 0,
  });
  page.addShape("rect", {
    x: MARGIN_X,
    y: 1.36,
    w: 1.35,
    h: 0.055,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });
}

function pptxChartType(pptx: PptxGenJS, chartType: ChartType) {
  if (chartType === "line") return pptx.ChartType.line;
  if (chartType === "pie") return pptx.ChartType.pie;
  return pptx.ChartType.bar;
}

function chartSeries(chartData: ChartData | undefined): PptxGenJS.OptsChartData[] | null {
  if (!chartData || chartData.labels.length === 0 || chartData.data.length === 0) {
    return null;
  }

  const labels = chartData.labels.map((label) => String(label));
  const series = (chartData.chartType === "pie" ? chartData.data.slice(0, 1) : chartData.data)
    .filter((item): item is ChartSeries => Boolean(item?.name) && Array.isArray(item?.data))
    .map((item) => ({
      name: item.name,
      labels,
      values: labels.map((_, index) => {
        const value = item.data[index];
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
      }),
    }));

  return series.length > 0 ? series : null;
}

function chartPalette(accent: string): string[] {
  return [0, 28, -32, 18, 52, -14].map((degrees) => {
    if (degrees === 0) return accent;
    return shiftHue(accent, degrees);
  });
}

function kpiCallouts(slide: Slide): KpiCallout[] {
  const source = asBullets(slide.content);
  const items = (source.length > 0 ? source : [slide.title || "Metric"]).slice(0, 6);
  return items.map(parseKpi);
}

function parseKpi(raw: string): KpiCallout {
  const text = raw.trim();
  const direction = directionOf(text);
  const parts = text.split("|").map((part) => cleanMetric(part)).filter(Boolean);

  if (parts.length >= 2) {
    return { label: parts[0], value: parts[1], direction: direction ?? directionOf(parts.slice(2).join(" ")) };
  }

  const colon = text.indexOf(":");
  if (colon > 0) {
    return {
      label: cleanMetric(text.slice(0, colon)),
      value: cleanMetric(text.slice(colon + 1)),
      direction,
    };
  }

  return { label: "Metric", value: cleanMetric(text) || text, direction };
}

function directionOf(text: string): "up" | "down" | null {
  const up = /↑|▲|⬆/.test(text);
  const down = /↓|▼|⬇/.test(text);
  if (up && !down) return "up";
  if (down && !up) return "down";
  if (/\b(increase|increased|growth|higher|up)\b/i.test(text)) return "up";
  if (/\b(decrease|decreased|decline|lower|down)\b/i.test(text)) return "down";

  const signed = text.match(/([+-])\s?\d+(?:\.\d+)?\s?%/);
  if (signed) return signed[1] === "+" ? "up" : "down";
  if (/^\s*\(/.test(text) || /-\s?\$/.test(text)) return "down";
  return null;
}

function cleanMetric(text: string) {
  return text.replace(/[↑↓▲▼⬆⬇]/g, "").replace(/\s+/g, " ").trim();
}

function tableMatrix(slide: Slide): string[][] {
  const fromContent = tableFromContent(slide.content);
  if (fromContent && fromContent.some((row) => row.length > 1)) {
    return fromContent;
  }

  const fromChart = tableFromChart(slide.chartData);
  if (fromChart) return fromChart;
  if (fromContent && fromContent.length > 0) return fromContent;

  const bullets = asBullets(slide.content);
  if (bullets.length > 0) return [["Detail"], ...bullets.map((bullet) => [bullet])];
  return [["Detail"], [slide.title || ""]];
}

function tableFromChart(chartData: ChartData | undefined): string[][] | null {
  if (!chartData || chartData.labels.length === 0 || chartData.data.length === 0) {
    return null;
  }

  const header = ["", ...chartData.data.map((series) => series.name || "Value")];
  const rows = chartData.labels.map((label, index) => [
    String(label),
    ...chartData.data.map((series) => formatCell(series.data[index])),
  ]);
  return [header, ...rows];
}

function tableFromContent(content: string | string[]): string[][] | null {
  const lines = (Array.isArray(content) ? content : content.split(/\r?\n/))
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !isMarkdownRule(line));

  if (lines.length === 0) return null;

  if (lines.some((line) => line.includes("|"))) {
    return lines.map((line) => splitDelimited(line, "|"));
  }

  if (lines.some((line) => line.includes("\t"))) {
    return lines.map((line) => splitDelimited(line, "\t"));
  }

  const pairs = lines.map((line) => {
    const colon = line.indexOf(":");
    if (colon <= 0) return null;
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  });
  if (pairs.every((pair) => pair !== null)) {
    return [["Item", "Value"], ...(pairs as string[][])];
  }

  return lines.map((line) => [line]);
}

function splitDelimited(line: string, delimiter: string) {
  const trimmed = line.replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(delimiter).map((cell) => cell.trim());
}

function isMarkdownRule(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function asBullets(content: string | string[]): string[] {
  const lines = Array.isArray(content) ? content : content.split(/\r?\n/);
  return lines
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0 && !isMarkdownRule(line));
}

function prose(content: string | string[]) {
  if (Array.isArray(content)) return content.map((line) => line.trim()).filter(Boolean).join("  ");
  return content.trim();
}

function formatCell(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeHex(color: string) {
  const hex = color.trim().replace(/^#/, "").toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(hex)) {
    throw new Error("Accent color must be a 6-digit hex value.");
  }
  return hex;
}

function normalizeLogo(logo: string | null | undefined) {
  if (!logo) return null;
  const trimmed = logo.trim();
  if (!trimmed) return null;

  const dataUrl = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\s]+)$/);
  if (dataUrl) {
    return `${dataUrl[1]};base64,${dataUrl[2].replace(/\s/g, "")}`;
  }

  if (/^image\/[a-zA-Z0-9.+-]+;base64,/.test(trimmed)) {
    return trimmed.replace(/\s/g, "");
  }

  if (/^[a-zA-Z0-9+/=\s]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length > 32) {
    return `image/png;base64,${trimmed.replace(/\s/g, "")}`;
  }

  throw new Error("Logo must be a base64 image or a data URL.");
}

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb) {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `${channel(r)}${channel(g)}${channel(b)}`;
}

function rgbToHsl({ r, g, b }: Rgb) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  if (s === 0) {
    const gray = l * 255;
    return { r: gray, g: gray, b: gray };
  }

  const hue = (p: number, q: number, t: number) => {
    let channel = t;
    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue(p, q, h + 1 / 3) * 255,
    g: hue(p, q, h) * 255,
    b: hue(p, q, h - 1 / 3) * 255,
  };
}

function shiftHue(hex: string, degrees: number) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  const next = (h + degrees / 360 + 1) % 1;
  const saturation = Math.max(s, 0.45);
  const lightness = Math.min(0.62, Math.max(0.38, l));
  return rgbToHex(hslToRgb(next, saturation, lightness));
}

function contrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "1A1A1A" : "FFFFFF";
}

function toBytes(output: string | ArrayBuffer | Blob | Uint8Array) {
  if (output instanceof Uint8Array) return output;
  if (output instanceof ArrayBuffer) return new Uint8Array(output);
  throw new Error("Presentation export did not return a file buffer.");
}
