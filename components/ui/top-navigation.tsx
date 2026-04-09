"use client"

import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

const navItems = ["vendors", "producers", "sponsors"] as const
type NavItem = (typeof navItems)[number]

export function TopNavigation() {
  const [activeItem, setActiveItem] = useState<NavItem>("vendors")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (navItems.includes(hash as NavItem)) {
        setActiveItem(hash as NavItem)
      } else {
        setActiveItem("vendors")
      }
      setMobileMenuOpen(false)
    }

    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  return (
    <header className="w-full px-4 pt-16 md:px-6 md:pt-20">
      <nav className="mx-auto w-full max-w-7xl">
        <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-[0_10px_30px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(148,163,184,0.12)] sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <a
              href="#vendors"
              onClick={() => {
                setActiveItem("vendors")
                setMobileMenuOpen(false)
              }}
              className="inline-flex h-11 items-center rounded-md border border-slate-200 bg-white/85 px-3 font-sans text-sm font-black uppercase tracking-[0.14em] text-slate-900 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100"
            >
              Sac_Tech_Week
            </a>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white/85 text-slate-700 transition-colors duration-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-slate-50/90 p-2 dark:border-slate-700 dark:bg-slate-800/85">
              <ul className="space-y-1 font-mono text-xs uppercase tracking-[0.16em]">
                {navItems.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item}`}
                      onClick={() => setActiveItem(item)}
                      className={`inline-flex h-10 w-full items-center gap-2 rounded-md px-3 ${
                        activeItem === item
                          ? "border border-sky-200 bg-white text-sky-700 shadow-[0_3px_10px_rgba(14,116,144,0.16)] dark:border-[#0de7bf]/40 dark:bg-slate-900 dark:text-[#0de7bf]"
                          : "border border-transparent text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="text-sky-500">./</span>
                      <span>{item}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[#0de7bf] bg-[#0de7bf] px-4 font-mono text-xs uppercase tracking-[0.15em] text-slate-950 transition-colors duration-200 hover:bg-[#0bcfa9]"
              >
                Submit_Event
              </button>
            </div>
          )}
        </div>

        <div className="hidden w-full grid-cols-1 gap-3 rounded-lg border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-[0_10px_30px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(148,163,184,0.12)] sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <a
            href="#vendors"
            onClick={() => setActiveItem("vendors")}
            className="inline-flex h-11 items-center justify-self-start rounded-md border border-slate-200 bg-white/80 px-4 font-sans text-sm font-black uppercase tracking-[0.16em] text-slate-900 transition-colors duration-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            Sac_Tech_Week
          </a>

          <ul className="flex flex-wrap items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/90 p-1.5 font-mono text-sm uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-800/85 dark:text-slate-200">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item}`}
                  onClick={() => setActiveItem(item)}
                  className={`inline-flex h-8 items-center gap-1 rounded-sm px-2.5 transition-all duration-300 ${
                    activeItem === item
                      ? "border border-sky-200 bg-white text-sky-700 shadow-[0_3px_10px_rgba(14,116,144,0.16)] dark:border-[#0de7bf]/40 dark:bg-slate-900 dark:text-[#0de7bf]"
                      : "border border-transparent text-slate-700 hover:border-slate-200 hover:bg-white/90 hover:text-sky-700 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-[#0de7bf]"
                  }`}
                >
                  <span className="text-sky-500">./</span>
                  <span>{item}</span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-self-end rounded-md border border-[#0de7bf] bg-[#0de7bf] px-4 font-mono text-sm uppercase tracking-[0.15em] text-slate-950 transition-colors duration-200 hover:bg-[#0bcfa9]"
          >
            Submit_Event
          </button>
        </div>
      </nav>
    </header>
  )
}
