"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { EVENTO, formatBRL } from "@/lib/event"
import { apiFetch, ApiError, type Batch } from "@/lib/api"
import { Countdown } from "./countdown"
import { MapPin, CalendarDays } from "lucide-react"

export function Hero() {
  const [batch, setBatch] = useState<Batch | null>(null)

  useEffect(() => {
    apiFetch<Batch>("/api/batches/current")
      .then(setBatch)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) console.error(err)
      })
  }, [])

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border/60"
    >
      {/* textura de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARTE_TEMA_PNG-yjXyUISAD2zxW9LCsRoLHX7gBinbPe.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center right",
          backgroundSize: "contain",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
            {EVENTO.edicao}
          </span>

          <h1 className="font-serif text-5xl font-bold leading-[0.95] text-balance text-foreground sm:text-6xl md:text-7xl">
            NA CONTRA
            <br />
            MÃO DO
            <br />
            <span className="text-primary">MUNDO</span>
          </h1>

          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            O congresso <strong className="text-foreground">Na Ksa do Pai</strong> chega em
            2026 para uma geração que decidiu viver na contramão. Inspirado em{" "}
            <span className="font-serif text-primary">{EVENTO.versiculo}</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {EVENTO.dataLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {EVENTO.cidade}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold"
              nativeButton={false}
              render={<a href="/inscricao" />}
            >
              Garantir minha vaga{batch ? ` · ${formatBRL(Number(batch.price))}` : ""}
            </Button>
            <a
              href="#tema"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Conhecer o tema
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 md:items-end">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARTE_TEMA_PNG-yjXyUISAD2zxW9LCsRoLHX7gBinbPe.png"
            alt="Arte do tema: Na Contra Mão do Mundo — Romanos 12:2"
            className="w-56 drop-shadow-[0_0_40px_rgba(180,120,70,0.25)] sm:w-72 md:w-80"
          />
          <div className="flex flex-col items-center gap-3 md:items-end">
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Contagem regressiva
            </span>
            <Countdown target={EVENTO.dataInicio} />
          </div>
        </div>
      </div>
    </section>
  )
}
