import { apiFetch, type PublicBatch } from "@/lib/api"
import { formatBRL } from "@/lib/event"
import { Button } from "@/components/ui/button"
import { Check, Lock, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export async function LotesSection() {
  const batches = await apiFetch<PublicBatch[]>("/api/batches", { cache: "no-store" }).catch(
    () => [] as PublicBatch[],
  )

  if (batches.length === 0) {
    return null
  }

  return (
    <section id="lotes" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Investimento
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Garanta sua vaga por lote
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            As vagas são liberadas por lotes. Quanto antes você se inscrever,
            menor o valor. Não perca o lote atual.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {batches.map((lote) => {
            const ativo = lote.status === "ativo"
            return (
              <div
                key={lote.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-colors",
                  ativo
                    ? "border-primary bg-card shadow-[0_0_50px_-12px_rgba(180,120,70,0.4)]"
                    : "border-border/60 bg-card/40",
                )}
              >
                {ativo && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                    Lote atual
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-semibold text-foreground">
                    {lote.name}
                  </h3>
                  {lote.status === "esgotado" && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> Encerrado
                    </span>
                  )}
                  {lote.status === "em-breve" && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Em breve
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span
                    className={cn(
                      "font-serif text-4xl font-bold",
                      lote.status === "esgotado"
                        ? "text-muted-foreground line-through"
                        : "text-primary",
                    )}
                  >
                    {formatBRL(Number(lote.price))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lote.status === "esgotado"
                    ? `Encerrou em ${new Date(lote.end_date).toLocaleDateString("pt-BR")}`
                    : `Válido até ${new Date(lote.end_date).toLocaleDateString("pt-BR")}`}
                </p>

                <ul className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
                  {["Camiseta Oficial", "Kit do participante"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>

                {ativo ? (
                  <Button
                    className="mt-8 w-full font-semibold"
                    nativeButton={false}
                    render={<a href="/inscricao" />}
                  >
                    Inscrever-se agora
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="secondary"
                    className="mt-8 w-full font-semibold"
                  >
                    {lote.status === "esgotado" ? "Encerrado" : "Aguarde"}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
