import { EVENTO } from "@/lib/event"
import { Flame, Users, Music, HeartHandshake } from "lucide-react"

const destaques = [
  {
    icon: Flame,
    titulo: "Ministrações",
    texto: "Preleções direto ao ponto sobre a vida real da juventude.",
  },
  {
    icon: Music,
    titulo: "Louvor & Adoração",
    texto: "Noites de muito louvor com os ministros locais e convidados.",
  },
  {
    icon: Users,
    titulo: "Comunhão",
    texto: "Tempo livre pra fazer amizade e reencontrar pessoas.",
  },
  {
    icon: HeartHandshake,
    titulo: "Consagração",
    texto: "Momento de oração e ministração durante os trabalhos.",
  },
]

export function EventSection() {
  return (
    <section id="evento" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            O Evento
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Dias para renovar a mente
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {EVENTO.dataLabel} · {EVENTO.cidade}. Uma imersão
            completa para quem não se conforma com este mundo.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destaques.map((d) => (
            <div
              key={d.titulo}
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <d.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                {d.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {d.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
