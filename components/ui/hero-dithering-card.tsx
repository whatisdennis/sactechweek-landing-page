"use client"

import { ArrowRight } from "lucide-react"
import { Suspense, lazy, useState } from "react"

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
)

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-105 bg-cover bg-center bg-no-repeat blur-[3px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.75)_35%,rgba(0,0,0,1)_100%)]"
        style={{
          backgroundImage: "url('/images/sacramento-river-map.png')",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,1) 100%)"
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-background/40" />

      <div
        className="relative z-10 w-full max-w-7xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden rounded-[48px] border border-border/70 bg-card/90 shadow-sm backdrop-blur-[1px] duration-500 md:min-h-[600px]">
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

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              SYSTEM_STATUS: EVOLVING
            </div>

            <h2 className="mb-8 text-5xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              SACRAMENTO TECH WEEK 2026_
            </h2>

            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              A decentralized Celebration of Innovation in the Capital Region connceting
              innovators, government, industry, and it&apos;s people
            </p>

            <button className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-12 text-base font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:ring-4 hover:ring-primary/20 active:scale-95">
              <span className="relative z-10">JOIN_EVENT</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
