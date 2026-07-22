"use client"

import { Button } from "@/components/ui/button"

const links = [
  { href: "#evento", label: "O Evento" },
  { href: "#tema", label: "Tema" },
  { href: "#lotes", label: "Lotes" },
  { href: "/inscricao", label: "Inscrição" },
  { href: "/minhas-inscricoes", label: "Minhas Inscrições" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#top" className="flex flex-col leading-none">
          <span className="font-serif text-lg font-semibold tracking-wide text-primary">
            NA KSA DO PAI
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Céus Abertos 2026
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button
          size="sm"
          className="font-semibold"
          nativeButton={false}
          render={<a href="/inscricao" />}
        >
          Garantir vaga
        </Button>
      </div>
    </header>
  )
}
