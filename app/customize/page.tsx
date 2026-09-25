import type { Metadata } from "next";
import { SiteNav } from "../components/site-nav";
import { CustomizeForm } from "./customize-form";

export const metadata: Metadata = {
  title: "Customize Your Deck — DeckFlow",
  description: "Choose a theme, accent color, and tell us what the presentation is for.",
};

export default function CustomizePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A]">
      <SiteNav />

      <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 md:px-8 md:py-20">
        <CustomizeForm />
      </main>
    </div>
  );
}
