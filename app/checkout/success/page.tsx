"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch, type Church, type Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode } from "@/components/qr-code";
import { GlowBackground } from "@/components/glow-background";
import Image from "next/image";

const TERMINAL_STATUSES = ["PAID", "EXEMPT", "CANCELLED", "EXPIRED", "REFUNDED"];
const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_nsu");

  const [order, setOrder] = useState<Order | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [gaveUp, setGaveUp] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valor só existe no cliente, gerado de propósito após a montagem
    setRegistrationNumber(String(Math.floor(100000 + Math.random() * 900000)));
  }, []);

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
      if (tries >= MAX_ATTEMPTS) {
        clearInterval(interval);
        if (!cancelled) setGaveUp(true);
      }
    }

    tick();
    interval = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Pagamento</h1>
        <p className="max-w-sm text-muted-foreground">
          Não encontramos referência da sua inscrição nesta página.
        </p>
        <Button render={<Link href="/minhas-inscricoes" />}>Ver minhas inscrições</Button>
      </div>
    );
  }

  const isPaid = order && (order.status === "PAID" || order.status === "EXEMPT");
  const isFailed = order && ["CANCELLED", "EXPIRED", "REFUNDED"].includes(order.status);

  if (isPaid) {
    const selectedParticipant =
      order.participants.find((p) => p.id === selectedParticipantId) ?? order.participants[0];

    return (
      <div className="relative mx-auto flex w-full max-w-2xl min-h-screen flex-1 flex-col justify-center items-center gap-8 px-4 pb-16 text-center md:px-6 md:py-20">
        <GlowBackground />
        {order.participants.length > 1 && (
          <Select
            value={selectedParticipant?.id}
            onValueChange={(v) => v && setSelectedParticipantId(v)}
          >
            <SelectTrigger className="w-full max-w-81.75">
              <SelectValue>
                {(v: string) => order.participants.find((p) => p.id === v)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {order.participants.map((participant) => (
                <SelectItem key={participant.id} value={participant.id}>
                  {participant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedParticipant && (
          <div className="w-full max-w-81.75 flex flex-col items-center justify-center">
            <Image src="/band.png" alt="Faixa" width={96} height={210} />

            <div className="bg-[url('/bg-cracha.png')] bg-cover bg-center bg-no-repeat flex flex-col gap-2 self-stretch justify-center items-center pt-20 pb-20 border border-white/10 rounded-t-2xl w-full -mt-5">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">
                #{registrationNumber ?? "------"}
              </p>

              <Image src="/logo.png" alt="Logo" width={245} height={44} />
            </div>
            <div className="bg-gray-700/10 backdrop-blur-3xl w-full p-6 flex flex-col items-center justify-center gap-4 rounded-b-2xl border border-white/20">
              <div className="flex flex-col">
                <h3 className="font-serif text-2xl font-semibold text-white">
                  {selectedParticipant.name}
                </h3>
                <p className="text-sm text-white/70 font-bold">
                  {churches.find((c) => c.id === selectedParticipant.churchId)?.name}
                </p>
              </div>

              <QrCode
                value="https://www.naksadopai.daviamom.dev.br"
                size={140}
              />

              <Image src="/logos-igreja.png" alt="Logo" width={196} height={51} className="mt-10" />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Pagamento aprovado
          </span>
          <h1 className="font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Inscrição confirmada!
          </h1>
          <p className="max-w-sm text-muted-foreground">
            Poste seu crachá digital. Nos vemos no congresso!
          </p>
        </div>

        <Button render={<Link href="/minhas-inscricoes" />} size="lg" className="font-semibold">
          Ver minhas inscrições
        </Button>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          O pagamento não foi confirmado
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Não identificamos a aprovação deste pagamento. Você pode tentar novamente.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" render={<Link href="/minhas-inscricoes" />}>
            Minhas inscrições
          </Button>
          <Button render={<Link href="/inscricao" />}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        {gaveUp ? "Ainda confirmando seu pagamento" : "Confirmando seu pagamento..."}
      </h1>
      <p className="max-w-sm text-muted-foreground">
        {gaveUp
          ? "Pode levar mais alguns instantes. Confira o status em Minhas inscrições."
          : "Isso costuma levar só alguns segundos."}
      </p>
      <Button render={<Link href="/minhas-inscricoes" />}>Ver minhas inscrições</Button>
    </div>
  );
}
