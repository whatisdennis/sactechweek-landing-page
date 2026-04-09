import { ArrowRight, Diamond, Hexagon, Sparkles } from "lucide-react"

const channels = [
  {
    id: "vendors",
    index: "01",
    title: "Vendors",
    route: "/vendors",
    description: "Booths, live demos, and hands-on product runs on the floor.",
    icon: Diamond
  },
  {
    id: "producers",
    index: "02",
    title: "Event_Producers",
    route: "/event-producers",
    description: "Satellite meetups, hack nights, and workshop tracks across the week.",
    icon: Hexagon
  },
  {
    id: "sponsors",
    index: "03",
    title: "Sponsors",
    route: "/sponsors",
    description: "Fuel the week with visibility that reaches builders, teams, and the region.",
    icon: Sparkles
  }
] as const

export function GetInvolvedSection() {
  return (
    <section
      id="get-involved"
      className="relative w-full scroll-mt-24 overflow-hidden px-4 pb-24 pt-16 md:px-6 md:pb-36 md:pt-24"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(56,189,248,0.18) 1px, transparent 1px), radial-gradient(circle, rgba(148,163,184,0.16) 1px, transparent 1px)",
          backgroundSize: "18px 18px, 18px 18px",
          backgroundPosition: "0 0, 9px 9px"
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/55 to-background/85 dark:from-background/80 dark:via-background/65 dark:to-background/90" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-10 text-center md:mb-16">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-sky-600">
            // module: outreach
          </p>
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            ./get_involved
          </h3>
          <p className="mx-auto max-w-xl text-base text-muted-foreground md:max-w-4xl md:whitespace-nowrap md:text-lg">
            Three ingress channels. One open queue. Plug into Sacramento Tech Week.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {channels.map((channel) => {
            const Icon = channel.icon

            return (
              <article
                key={channel.id}
                id={channel.id}
                className="scroll-mt-24 rounded-lg border border-slate-200/90 bg-white/85 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_8px_24px_rgba(2,6,23,0.35)] md:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="pt-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-sky-600 md:text-xs">
                      {channel.index}
                    </span>

                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-[#0de7bf] md:h-10 md:w-10">
                      <Icon className="h-4 w-4" />
                    </span>

                    <div>
                      <h4 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-xl">
                        {channel.title}
                      </h4>
                      <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-sky-600">
                        route: {channel.route}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 md:text-base">
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 self-start rounded-md border border-[#0de7bf] bg-[#0de7bf] px-4 font-mono text-xs uppercase tracking-[0.15em] text-slate-950 transition-colors duration-200 hover:bg-[#0bcfa9] md:w-auto md:self-auto"
                  >
                    exec_register
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
