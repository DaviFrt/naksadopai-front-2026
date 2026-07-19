"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch, type Church, type Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ParticipantBadge } from "@/components/participant-badge";

const TERMINAL_STATUSES = ["PAID", "EXEMPT", "CANCELLED", "EXPIRED", "REFUNDED"];
const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPendingContent />
    </Suspense>
  );
}

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("external_reference");

  const [order, setOrder] = useState<Order | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    apiFetch<Church[]>("/api/churches").then(setChurches).catch(() => setChurches([]));
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let tries = 0;
    let interval: ReturnType<typeof setInterval>;

    async function tick() {
      try {
        const data = await apiFetch<Order>(`/api/orders/${orderId}`);
        if (cancelled) return;
        setOrder(data);
        if (TERMINAL_STATUSES.includes(data.status)) {
          clearInterval(interval);
        }
      } catch {
        // segue tentando
      }
      tries++;
      if (tries >= MAX_ATTEMPTS) clearInterval(interval);
    }

    tick();
    interval = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId]);

  const isPaid = order && (order.status === "PAID" || order.status === "EXEMPT");

  if (isPaid) {
    return (
      <div className="mx-auto min-h-screen flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-4 py-16 text-center md:px-6 md:py-20">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Pagamento aprovado
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Inscrição confirmada!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Guarde seu crachá digital abaixo. Nos vemos no congresso!
          </p>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-2">
          {order.participants.map((participant) => (
            <ParticipantBadge
              key={participant.id}
              name={participant.name}
              churchName={churches.find((c) => c.id === participant.churchId)?.name}
              shirtSize={participant.shirtSize}
            />
          ))}
        </div>

        <Button render={<Link href="/minhas-inscricoes" />} size="lg" className="font-semibold">
          Ver minhas inscrições
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
        Pagamento
      </span>
      <h1 className="font-serif text-3xl font-bold text-foreground">Pagamento pendente</h1>
      <p className="max-w-sm text-muted-foreground">
        Estamos aguardando a confirmação do seu pagamento (comum em boleto/pix). Isso pode levar
        alguns instantes — ou até 1 dia útil, no caso de boleto.
      </p>
      <Button render={<Link href="/minhas-inscricoes" />}>Ver minhas inscrições</Button>
    </div>
  );
}
