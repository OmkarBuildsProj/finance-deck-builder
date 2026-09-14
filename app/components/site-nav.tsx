export function SiteNav() {
  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-8">
        <a href="/" className="text-lg font-semibold tracking-tight">
          DeckFlow
        </a>
        <div className="flex items-center gap-8 text-sm text-gray-400">
          <a
            href="/#how-it-works"
            className="transition-colors duration-300 hover:text-white"
          >
            How It Works
          </a>
          <a
            href="/upload"
            className="transition-colors duration-300 hover:text-white"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}
