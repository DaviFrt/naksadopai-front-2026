export function ShirtSection() {
  return (
    <section id="camisa" className="border-b border-border/60 bg-card/40 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Camisa oficial do evento
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Todo participante inscrito nos lotes com direito a camisa recebe a
            peça oficial do evento.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-border/60 bg-card">
          <img
            src="/camisa-horizontal.jpg"
            alt="Camisa oficial do evento Na Contra Mão do Mundo — Romanos 12:2"
            className="hidden w-full md:block"
          />
          <img
            src="/camisa-vertical.jpg"
            alt="Camisa oficial do evento Na Contra Mão do Mundo — Romanos 12:2"
            className="block w-full md:hidden"
          />
        </div>
      </div>
    </section>
  )
}
