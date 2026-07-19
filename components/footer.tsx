import { EVENTO } from "@/lib/event"

export function SiteFooter() {
  return (
    <footer className="py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO_PNG-lsliQYjEEbYgVM38OqDESOp05aaBml.png"
            alt="Logos: IEAB, Céus Abertos 2026 e Na Ksa do Pai"
            className="w-full max-w-[200px] opacity-90"
          />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Realização · {EVENTO.realizacao}
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 {EVENTO.nome}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
