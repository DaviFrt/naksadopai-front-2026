"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/use-session";
import { apiFetch, ApiError, type Batch, type Church, type Gender, type Order, type ShirtSize, type User } from "@/lib/api";
import { AuthTabs } from "@/components/auth-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BirthDateSelect } from "@/components/birth-date-select";
import { GlowBackground } from "@/components/glow-background";
import { Plus, X } from "lucide-react";

interface ParticipantForm {
  name: string;
  birth_date: string;
  gender: Gender;
  shirt_size: ShirtSize;
  church_id: string;
}

const SHIRT_SIZES: ShirtSize[] = ["PP", "P", "M", "G", "GG", "XG"];

function emptyParticipant(): ParticipantForm {
  return { name: "", birth_date: "", gender: "MALE", shirt_size: "M", church_id: "" };
}

function isParticipantComplete(p: ParticipantForm) {
  return Boolean(p.name && p.birth_date && p.church_id);
}

type Step = "details" | "auth";

export default function InscricaoPage() {
  const router = useRouter();
  const { user, loading, refresh } = useSession();

  const [step, setStep] = useState<Step>("details");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    apiFetch<Batch>("/api/batches/current")
      .then(setBatch)
      .catch((err) => setBatchError(err instanceof ApiError ? err.message : "Inscrições encerradas."));

    apiFetch<Church[]>("/api/churches").then(setChurches).catch(() => setChurches([]));
  }, []);

  function updateParticipant(index: number, patch: Partial<ParticipantForm>) {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function removeParticipant(index: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitOrder() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setPending(true);

    try {
      const { order } = await apiFetch<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ participants }),
      });

      const { init_point } = await apiFetch<{ init_point: string }>(
        `/api/orders/${order.id}/checkout`,
        { method: "POST" },
      );

      window.location.href = init_point;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir sua inscrição. Por favor, entre em contato com a liderança e informe o erro.",
      );
      setPending(false);
      submittingRef.current = false;
    }
  }

  function handleContinue() {
    if (loading) return;
    if (!user) {
      setStep("auth");
      return;
    }
    submitOrder();
  }

  function handleAuthSuccess(authenticatedUser: User) {
    if (authenticatedUser.role === "ADMIN") {
      router.push("/admin/pedidos");
      return;
    }
    refresh();
    submitOrder();
  }

  const isComplete = participants.length > 0 && participants.every(isParticipantComplete);
  const canAddParticipant = participants.length > 0 && isParticipantComplete(participants[participants.length - 1]);
  const total = batch ? Number(batch.price) * participants.length : 0;

  return (
    <div className="relative flex-1 min-h-screen overflow-hidden">
      <GlowBackground />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 md:px-6 md:py-20">
        <div>
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Inscrição
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Na Contramão do Mundo
        </h1>
        {batch && (
          <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
            {batch.name} · R$ {Number(batch.price).toFixed(2)} por pessoa
          </span>
        )}
        {batch && batch.min_participant_age !== null && (
          <p className="mt-3 text-sm text-muted-foreground">
            Inscrições abertas somente para participantes a partir de {batch.min_participant_age}{" "}
            anos.
          </p>
        )}
      </div>

      {batchError && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-foreground">{batchError}</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {step === "auth" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8">
          {pending ? (
            <p className="text-center text-muted-foreground">Finalizando sua inscrição...</p>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                Entre ou crie uma conta para concluir sua inscrição.
              </p>
              <AuthTabs initialTab="login" onSuccess={handleAuthSuccess} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep("details")}>
                Voltar
              </Button>
            </>
          )}
        </div>
      )}

      {step === "details" && !batchError && (
        <div className="flex flex-col gap-6">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-serif font-semibold text-primary">Participante {index + 1}</p>
                {participants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeParticipant(index)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`name-${index}`}>Nome</Label>
                <Input
                  id={`name-${index}`}
                  required
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, { name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Data de nascimento</Label>
                <BirthDateSelect
                  value={participant.birth_date}
                  onChange={(v) => updateParticipant(index, { birth_date: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Gênero</Label>
                  <Select
                    value={participant.gender}
                    onValueChange={(v) => v && updateParticipant(index, { gender: v as Gender })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v: string) => (v === "MALE" ? "Masculino" : "Feminino")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Masculino</SelectItem>
                      <SelectItem value="FEMALE">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Tamanho da camisa</Label>
                  <Select
                    value={participant.shirt_size}
                    onValueChange={(v) => v && updateParticipant(index, { shirt_size: v as ShirtSize })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIRT_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Igreja</Label>
                  <Select
                    value={participant.church_id || undefined}
                    onValueChange={(v) => v && updateParticipant(index, { church_id: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione">
                        {(v: string) => churches.find((c) => c.id === v)?.name ?? "Selecione"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={!canAddParticipant}
            onClick={() => setParticipants((prev) => [...prev, emptyParticipant()])}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Adicionar participante
          </Button>

          {batch && (
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {participants.length} participante{participants.length === 1 ? "" : "s"} × R${" "}
                  {Number(batch.price).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between font-serif text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            disabled={!batch || loading || pending || !isComplete}
            onClick={handleContinue}
            className="font-semibold"
          >
            {pending ? "Enviando..." : "Ir para pagamento"}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
