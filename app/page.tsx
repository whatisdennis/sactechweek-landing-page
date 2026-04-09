import DemoOne from "@/components/ui/demo"
import { TopNavigation } from "@/components/ui/top-navigation"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="fixed right-4 top-4 z-30 md:right-6 md:top-6">
        <ThemeSwitcher />
      </div>

      <div className="absolute inset-x-0 top-0 z-20">
        <TopNavigation />
      </div>

      <DemoOne />

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 px-4 py-6 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/70 md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300 sm:flex-row sm:gap-3 sm:text-xs sm:text-left">
          <span>Sac_Tech_Week 2026</span>
          <span>Built_For_Sacramento</span>
        </div>
      </footer>
    </main>
  )
}
