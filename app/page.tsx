function UploadIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function CustomizeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v12" />
      <path d="M8 12l4 4 4-4" />
      <path d="M4 20h16" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .267.18.578.688.48A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

const steps = [
  {
    title: "Upload Your Data",
    description: "Drop in your Excel, CSV, or PDF files.",
    icon: UploadIcon,
  },
  {
    title: "Customize Your Deck",
    description: "Pick a theme, accent color, and tell us what the presentation is for.",
    icon: CustomizeIcon,
  },
  {
    title: "Download & Present",
    description: "Get a polished .pptx file ready for the boardroom.",
    icon: DownloadIcon,
  },
];

const cardClassName =
  "rounded-2xl border border-transparent bg-[#111111] p-10 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-[#3B82F6]";

const features = [
  {
    title: "AI-Powered Analysis",
    description: "Automatically identifies key metrics, trends, and insights from your data.",
  },
  {
    title: "Professional Themes",
    description: "Three premium themes designed for corporate, modern, and clean presentations.",
  },
  {
    title: "Instant Export",
    description: "Download a real .pptx file that opens in PowerPoint and Google Slides.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#0A0A0A]">
      <header className="w-full">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-8">
          <a href="/" className="text-lg font-semibold tracking-tight">
            DeckFlow
          </a>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#how-it-works" className="transition-colors duration-200 hover:text-white">
              How It Works
            </a>
            <a href="#get-started" className="transition-colors duration-200 hover:text-white">
              Get Started
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-8 py-32 text-center md:py-40">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            Turn Financial Data Into Boardroom-Ready Slides
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400">
            Upload your spreadsheet. Choose your style. Download a polished
            presentation in seconds.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#get-started"
              className="rounded-full bg-[#3B82F6] px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/5"
            >
              See How It Works
            </a>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-8 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className={cardClassName}>
                <div className="text-[#3B82F6]">
                  <step.icon />
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-8 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Built for Finance Professionals
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className={cardClassName}>
                <h3 className="text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="get-started" className="mx-auto max-w-4xl px-8 py-32 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to build your next deck?
          </h2>
          <a
            href="#get-started"
            className="mt-10 inline-block rounded-full bg-[#3B82F6] px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
          >
            Get Started
          </a>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-10">
        <p className="text-sm text-gray-400">Built by Omkar Sathe</p>
        <a
          href="https://github.com/OmkarBuildsProj/finance-deck-builder"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 transition-colors duration-200 hover:text-white"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </a>
      </footer>
    </div>
  );
}
