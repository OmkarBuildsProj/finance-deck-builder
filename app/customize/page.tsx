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

      <main className="flex flex-1 flex-col px-8 py-12 md:py-20">
        <CustomizeForm />
      </main>
    </div>
  );
}
