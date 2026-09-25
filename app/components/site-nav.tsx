export function SiteNav() {
  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <a href="/" className="text-lg font-semibold tracking-tight transition-transform duration-300 hover:scale-[1.03]">
          DeckFlow
        </a>
        <div className="flex items-center gap-3 text-xs text-gray-400 sm:gap-8 sm:text-sm">
          <a
            href="/#how-it-works"
            className="transition-all duration-300 hover:scale-[1.03] hover:text-white"
          >
            How It Works
          </a>
          <a
            href="/upload"
            className="transition-all duration-300 hover:scale-[1.03] hover:text-white"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}
