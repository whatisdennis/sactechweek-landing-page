const navItems = ["vendors", "producers", "sponsors"]

export function TopNavigation() {
  return (
    <header className="w-full px-4 pt-6 md:px-6 md:pt-8">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-center">
        <ul className="flex flex-wrap items-center justify-center gap-6 rounded-full border border-white/35 bg-white/15 px-6 py-3 font-mono text-sm tracking-[0.18em] text-cyan-950 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,6,23,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] md:gap-10">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item}`}
                className="inline-flex items-center gap-1 text-cyan-950/85 transition-colors duration-200 hover:text-cyan-700"
              >
                <span className="text-sky-500">./</span>
                <span>{item}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
