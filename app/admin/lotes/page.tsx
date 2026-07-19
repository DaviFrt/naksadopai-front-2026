"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError, type AdminBatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Loader2 } from "lucide-react";

function toDateInput(value: string) {
  return value.slice(0, 10);
}

interface BatchFormState {
  name: string;
  start_date: string;
  end_date: string;
  price: string;
}

const emptyForm: BatchFormState = { name: "", start_date: "", end_date: "", price: "" };

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<AdminBatch[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBatch | null>(null);

  function load() {
    apiFetch<AdminBatch[]>("/api/admin/batches").then(setBatches);
  }

  useEffect(load, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase text-brand-gold">Lotes</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Novo lote
          </Button>
          <DialogContent>
            <BatchForm
              title="Novo lote"
              onSaved={() => {
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {batches === null && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando lotes...</span>
          </div>
        )}
        {batches?.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
          >
            <div>
              <p className="font-semibold text-foreground">{batch.name}</p>
              <p className="text-sm text-muted-foreground">
                {toDateInput(batch.startDate)} a {toDateInput(batch.endDate)} — R${" "}
                {Number(batch.price).toFixed(2)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(batch)}>
              <Pencil className="size-3.5" data-icon="inline-start" />
              Editar
            </Button>
          </div>
        ))}
        {batches?.length === 0 && (
          <p className="text-muted-foreground">Nenhum lote cadastrado.</p>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          {editing && (
            <BatchForm
              title="Editar lote"
              batch={editing}
              onSaved={() => {
                setEditing(null);
                load();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BatchForm({
  title,
  batch,
  onSaved,
}: {
  title: string;
  batch?: AdminBatch;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BatchFormState>(
    batch
      ? {
          name: batch.name,
          start_date: toDateInput(batch.startDate),
          end_date: toDateInput(batch.endDate),
          price: String(batch.price),
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const path = batch ? `/api/admin/batches/${batch.id}` : "/api/admin/batches";
      await apiFetch(path, {
        method: batch ? "PATCH" : "POST",
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Datas e valor cobrado por participante neste lote.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="batch-name">Nome</Label>
        <Input
          id="batch-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="batch-start">Início</Label>
          <Input
            id="batch-start"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="batch-end">Fim</Label>
          <Input
            id="batch-end"
            type="date"
            required
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="batch-price">Preço (R$)</Label>
        <Input
          id="batch-price"
          type="number"
          step="0.01"
          min="0"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="ghost" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
