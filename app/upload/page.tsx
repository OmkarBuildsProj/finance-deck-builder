import type { Metadata } from "next";
import { SiteNav } from "../components/site-nav";
import { UploadZone } from "./upload-zone";

export const metadata: Metadata = {
  title: "Upload Your Data — DeckFlow",
  description: "Drag and drop your financial data file to start building your deck.",
};

export default function UploadPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A]">
      <SiteNav />

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 md:px-8 md:py-24">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Upload Your Financial Data
          </h1>
          <p className="mt-6 text-lg text-gray-400">
            Drag and drop your file or click to browse.
          </p>
        </div>

        <div className="mt-16 w-full">
          <UploadZone />
        </div>
      </main>
    </div>
  );
}
