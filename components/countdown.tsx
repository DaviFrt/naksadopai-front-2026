"use client"

import { useEffect, useState } from "react"

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now())
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutos = Math.floor((diff / (1000 * 60)) % 60)
  const segundos = Math.floor((diff / 1000) % 60)
  return { dias, horas, minutos, segundos }
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime()
  const [time, setTime] = useState(() => getRemaining(targetMs))

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const units = [
    { label: "Dias", value: time.dias },
    { label: "Horas", value: time.horas },
    { label: "Min", value: time.minutos },
    { label: "Seg", value: time.segundos },
  ]

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[64px] flex-col items-center rounded-lg border border-border/60 bg-card/60 px-3 py-2 backdrop-blur-sm sm:min-w-[76px]"
        >
          <span className="font-serif text-2xl font-semibold tabular-nums text-primary sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}
