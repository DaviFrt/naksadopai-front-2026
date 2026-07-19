"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError, type Church } from "@/lib/api";
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
import { Plus, Pencil } from "lucide-react";

export default function AdminChurchesPage() {
  const [churches, setChurches] = useState<Church[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Church | null>(null);

  function load() {
    apiFetch<Church[]>("/api/admin/churches").then(setChurches);
  }

  useEffect(load, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase text-brand-gold">Igrejas</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Nova igreja
          </Button>
          <DialogContent>
            <ChurchForm
              title="Nova igreja"
              onSaved={() => {
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {churches?.map((church) => (
          <div
            key={church.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
          >
            <span className="font-medium text-foreground">{church.name}</span>
            <Button variant="outline" size="sm" onClick={() => setEditing(church)}>
              <Pencil className="size-3.5" data-icon="inline-start" />
              Editar
            </Button>
          </div>
        ))}
        {churches?.length === 0 && (
          <p className="text-muted-foreground">Nenhuma igreja cadastrada.</p>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          {editing && (
            <ChurchForm
              title="Editar igreja"
              church={editing}
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

function ChurchForm({
  title,
  church,
  onSaved,
}: {
  title: string;
  church?: Church;
  onSaved: () => void;
}) {
  const [name, setName] = useState(church?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const path = church ? `/api/admin/churches/${church.id}` : "/api/admin/churches";
      await apiFetch(path, {
        method: church ? "PATCH" : "POST",
        body: JSON.stringify({ name }),
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
        <DialogDescription>Nome exibido no formulário de inscrição.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="church-name">Nome</Label>
        <Input
          id="church-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
