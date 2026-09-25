import type { Metadata } from "next";
import { SiteNav } from "../components/site-nav";
import { PreviewBoard } from "./preview-board";

export const metadata: Metadata = {
  title: "Preview — DeckFlow",
  description: "Review, reorder, and download your generated slide outline.",
};

export default function PreviewPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A]">
      <SiteNav />

      <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 md:px-8 md:py-16">
        <PreviewBoard />
      </main>
    </div>
  );
}
