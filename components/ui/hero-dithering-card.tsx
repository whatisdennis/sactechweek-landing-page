"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { Suspense, lazy, useState } from "react"

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
)

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 pb-8 pt-24 md:px-6 md:py-8"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-105 bg-cover bg-center bg-no-repeat blur-[3px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.75)_35%,rgba(0,0,0,1)_100%)]"
        style={{
          backgroundImage: "url('/images/sacramento-river-city.webp')",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,1) 100%)"
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-background/40 dark:bg-background/55" />

      <div
        className="relative z-10 w-full max-w-7xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-card/90 shadow-sm backdrop-blur-[1px] duration-500 sm:min-h-[560px] md:min-h-[600px]">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#38BDF8"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-5">
            <div className="max-w-[58%] truncate rounded-md border border-slate-200 bg-white/85 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-slate-800 shadow-[0_3px_10px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 sm:max-w-none sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.12em]">
              $ ./sac-tech-week.sh
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white/85 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-slate-800 shadow-[0_3px_10px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.12em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              System_Status
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-16 text-center sm:px-6 sm:pt-14 md:pt-8">
            <h2 className="mb-6 text-3xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground sm:text-4xl md:mb-8 md:text-7xl lg:text-8xl">
              SACRAMENTO TECH WEEK 2026_
            </h2>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:mb-12 md:text-xl">
              A decentralized Celebration of Innovation in the Capital Region connceting
              innovators, government, industry, and it&apos;s people
            </p>

            <button className="group relative inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-md border border-[#0de7bf] bg-[#0de7bf] px-4 font-mono text-sm uppercase tracking-[0.15em] text-slate-950 transition-colors duration-200 hover:bg-[#0bcfa9] sm:w-auto sm:max-w-none">
              <span className="relative z-10">JOIN_EVENT</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>

      <a
        href="#get-involved"
        className="group absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-md border border-slate-200 bg-white/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-700 shadow-[0_3px_10px_rgba(15,23,42,0.1)] transition-colors duration-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900 sm:bottom-6 sm:text-xs"
      >
        Scroll_Down
        <ChevronDown className="h-4 w-4 animate-bounce text-sky-600" />
      </a>
    </section>
  )
}
