import DemoOne from "@/components/ui/demo"
import { TopNavigation } from "@/components/ui/top-navigation"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 z-20">
        <TopNavigation />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <DemoOne />
      </div>
    </main>
  )
}
