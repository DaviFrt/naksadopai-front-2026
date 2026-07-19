import { EVENTO } from "@/lib/event"

export function ThemeSection() {
  return (
    <section id="tema" className="border-b border-border/60 bg-card/40 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          O Tema
        </span>
        <h2 className="mt-4 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
          {EVENTO.tema}
        </h2>
        <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
          &ldquo;E não vos conformeis com este mundo, mas transformai-vos pela
          renovação da vossa mente, para que experimenteis qual seja a boa,
          agradável, e perfeita vontade de Deus.&rdquo;
        </p>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          {EVENTO.versiculo}
        </p>
      </div>
    </section>
  )
}
