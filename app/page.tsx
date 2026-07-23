import { SiteHeader } from "@/components/header"
import { Hero } from "@/components/hero"
import { EventSection } from "@/components/event-section"
import { ThemeSection } from "@/components/theme-section"
import { LotesSection } from "@/components/lotes-section"
import { ShirtSection } from "@/components/shirt-section"
import { SiteFooter } from "@/components/footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <EventSection />
        <ThemeSection />
        <LotesSection />
        <ShirtSection />
      </main>
      <SiteFooter />
    </div>
  )
}
