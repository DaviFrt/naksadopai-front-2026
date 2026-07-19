import { EVENTO } from "@/lib/event";

export function ParticipantBadge({
  name,
  churchName,
  shirtSize,
}: {
  name: string;
  churchName: string | undefined;
  shirtSize: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card">
      <div className="flex flex-col items-center gap-1 bg-primary/10 px-6 py-4 text-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
          {EVENTO.edicao}
        </span>
        <span className="font-serif text-sm font-semibold uppercase tracking-wide text-foreground">
          {EVENTO.tema}
        </span>
      </div>

      <div
        aria-hidden
        className="relative border-y border-dashed border-primary/30"
      >
        <span className="absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-background" />
      </div>

      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Participante
        </span>
        <h3 className="font-serif text-2xl font-bold text-balance text-foreground">{name}</h3>
        {churchName && <p className="text-sm text-muted-foreground">{churchName}</p>}

        <div className="mt-2 flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          Camisa {shirtSize}
        </div>
      </div>
    </div>
  );
}
