"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

type Theme = "light" | "dark"

const THEME_STORAGE_KEY = "sac-tech-week-theme"

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const initialTheme: Theme = storedTheme === "dark" ? "dark" : "light"

    applyTheme(initialTheme)
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    applyTheme(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="group inline-flex h-11 items-center gap-2 rounded-md border border-slate-200/90 bg-white/80 px-3 font-mono text-xs uppercase tracking-[0.14em] text-slate-700 backdrop-blur-md transition-colors duration-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
    >
      {mounted && theme === "dark" ? (
        <Moon className="h-4 w-4 text-[#0de7bf]" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      )}
      <span>{mounted && theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  )
}
