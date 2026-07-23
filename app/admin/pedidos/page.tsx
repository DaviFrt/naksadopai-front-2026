"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  ApiError,
  type AdminBatch,
  type AdminOrder,
  type AdminOrdersResponse,
  type Church,
  type Gender,
  type OrderStatus,
  type PaymentMethod,
  type ShirtSize,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BirthDateSelect } from "@/components/birth-date-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  EXEMPT: "Isento",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "text-brand-tan",
  PAID: "text-emerald-400",
  EXEMPT: "text-muted-foreground",
  CANCELLED: "text-red-400",
  EXPIRED: "text-red-400/70",
  REFUNDED: "text-red-400/70",
};

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  INFINITE_PAY: "InfinitePay",
  PIX_MANUAL: "Pix (manual)",
  CASH: "Dinheiro",
  CARD_MANUAL: "Cartão (manual)",
};

const MANUAL_PAYMENT_METHODS: PaymentMethod[] = ["PIX_MANUAL", "CASH", "CARD_MANUAL"];
const SHIRT_SIZES: ShirtSize[] = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
const GENDER_LABEL: Record<Gender, string> = { MALE: "M", FEMALE: "F" };
const ALL = "__all__";

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

interface Filters {
  status: string;
  church_id: string;
  batch_id: string;
  source: string;
  search: string;
  page: number;
  page_size: number;
}

const emptyFilters: Filters = {
  status: "",
  church_id: "",
  batch_id: "",
  source: "",
  search: "",
  page: 1,
  page_size: 20,
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [response, setResponse] = useState<AdminOrdersResponse | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function load() {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.church_id) params.set("church_id", filters.church_id);
    if (filters.batch_id) params.set("batch_id", filters.batch_id);
    if (filters.source) params.set("source", filters.source);
    if (filters.search) params.set("search", filters.search);
    params.set("page", String(filters.page));
    params.set("page_size", String(filters.page_size));

    setLoading(true);
    apiFetch<AdminOrdersResponse>(`/api/admin/orders?${params.toString()}`)
      .then(setResponse)
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  useEffect(() => {
    apiFetch<Church[]>("/api/admin/churches").then(setChurches);
    apiFetch<AdminBatch[]>("/api/admin/batches").then(setBatches);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const rows =
    response?.data.flatMap((order) =>
      order.participants.map((participant) => ({ order, participant })),
    ) ?? [];

  const hasActiveFilters =
    filters.status || filters.church_id || filters.batch_id || filters.source || filters.search;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold uppercase text-brand-gold">Inscrições</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Novo pedido manual
          </Button>
          <DialogContent className="max-w-2xl">
            <NewOrderForm
              churches={churches}
              batches={batches}
              onCreated={() => {
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome..."
          className="h-9 max-w-xs"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Select
          value={filters.status || ALL}
          onValueChange={(v) => setFilters({ ...filters, status: !v || v === ALL ? "" : v, page: 1 })}
        >
          <SelectTrigger size="sm" className="h-9">
            <SelectValue placeholder="Status">
              {(v: string) => (v === ALL ? "Status" : STATUS_LABEL[v as OrderStatus])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.church_id || ALL}
          onValueChange={(v) => setFilters({ ...filters, church_id: !v || v === ALL ? "" : v, page: 1 })}
        >
          <SelectTrigger size="sm" className="h-9">
            <SelectValue placeholder="Igreja">
              {(v: string) =>
                v === ALL ? "Igreja" : (churches.find((c) => c.id === v)?.name ?? "Igreja")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Igreja</SelectItem>
            {churches.map((church) => (
              <SelectItem key={church.id} value={church.id}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.batch_id || ALL}
          onValueChange={(v) => setFilters({ ...filters, batch_id: !v || v === ALL ? "" : v, page: 1 })}
        >
          <SelectTrigger size="sm" className="h-9">
            <SelectValue placeholder="Lote">
              {(v: string) =>
                v === ALL ? "Lote" : (batches.find((b) => b.id === v)?.name ?? "Lote")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Lote</SelectItem>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.source || ALL}
          onValueChange={(v) => setFilters({ ...filters, source: !v || v === ALL ? "" : v, page: 1 })}
        >
          <SelectTrigger size="sm" className="h-9">
            <SelectValue placeholder="Origem">
              {(v: string) => (v === ALL ? "Origem" : v === "SITE" ? "Site" : "Admin")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Origem</SelectItem>
            <SelectItem value="SITE">Site</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setFilters(emptyFilters);
            }}
          >
            <X className="size-3.5" data-icon="inline-start" />
            Limpar
          </Button>
        )}
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-border">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
        <table className="w-full min-w-225 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-3 font-semibold">Nome</th>
              <th className="px-3 py-3 font-semibold">Nascimento</th>
              <th className="px-3 py-3 font-semibold">Idade</th>
              <th className="px-3 py-3 font-semibold">Sexo</th>
              <th className="px-3 py-3 font-semibold">Camisa</th>
              <th className="px-3 py-3 font-semibold">Igreja</th>
              <th className="px-3 py-3 font-semibold">Valor</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ order, participant }) => (
              <ParticipantRow
                key={participant.id}
                order={order}
                participant={participant}
                churches={churches}
                groupSize={order.participants.length}
                onChanged={load}
              />
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-muted-foreground">Nenhuma inscrição encontrada.</p>
        )}
      </div>

      {response && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {response.page} de {Math.max(1, Math.ceil(response.total / response.page_size))} ·{" "}
            {response.total} pedido{response.total === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={filters.page * response.page_size >= response.total}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Próxima
          </Button>

          <Select
            value={String(filters.page_size)}
            onValueChange={(v) =>
              v && setFilters({ ...filters, page_size: Number(v), page: 1 })
            }
          >
            <SelectTrigger size="sm" className="h-9 w-auto">
              <SelectValue>{(v: string) => `${v} por página`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  order,
  participant,
  churches,
  groupSize,
  onChanged,
}: {
  order: AdminOrder;
  participant: AdminOrder["participants"][number];
  churches: Church[];
  groupSize: number;
  onChanged: () => void;
}) {
  const [name, setName] = useState(participant.name);
  const [birthDate, setBirthDate] = useState(participant.birthDate.slice(0, 10));
  const [gender, setGender] = useState<Gender>(participant.gender);
  const [shirtSize, setShirtSize] = useState<ShirtSize>(participant.shirtSize);
  const [churchId, setChurchId] = useState(participant.churchId);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    order.paymentMethod ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  async function saveParticipant(patch: {
    name?: string;
    birth_date?: string;
    gender?: Gender;
    shirt_size?: ShirtSize;
    church_id?: string;
  }) {
    setError(null);
    try {
      await apiFetch(`/api/admin/orders/${order.id}/participants/${participant.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    }
  }

  async function saveOrder(patch: { status?: OrderStatus; payment_method?: PaymentMethod }) {
    setError(null);
    try {
      await apiFetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    }
  }

  const unitValue = Number(order.totalAmount) / order.participants.length;
  const isInfinitePay = order.paymentMethod === "INFINITE_PAY";

  return (
    <>
      <tr className="border-b border-border/60 hover:bg-muted/40">
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Input
              className="h-8 min-w-36 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name !== participant.name && saveParticipant({ name })}
            />
            {groupSize > 1 && (
              <span
                title={`Pedido com ${groupSize} participantes`}
                className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
              >
                {groupSize}
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="min-w-52">
            <BirthDateSelect
              value={birthDate}
              onChange={(v) => {
                setBirthDate(v);
                saveParticipant({ birth_date: v });
              }}
            />
          </div>
        </td>
        <td className="px-3 py-2 text-muted-foreground">{calculateAge(birthDate)}</td>
        <td className="px-3 py-2">
          <Select
            value={gender}
            onValueChange={(v) => {
              const value = v as Gender;
              setGender(value);
              saveParticipant({ gender: value });
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-16">
              <SelectValue>{(v: string) => GENDER_LABEL[v as Gender]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GENDER_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-3 py-2">
          <Select
            value={shirtSize}
            onValueChange={(v) => {
              const value = v as ShirtSize;
              setShirtSize(value);
              saveParticipant({ shirt_size: value });
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-16">
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
        </td>
        <td className="px-3 py-2">
          <Select
            value={churchId}
            onValueChange={(v) => {
              if (!v) return;
              setChurchId(v);
              saveParticipant({ church_id: v });
            }}
          >
            <SelectTrigger size="sm" className="h-8 max-w-40">
              <SelectValue>
                {(v: string) => churches.find((c) => c.id === v)?.name ?? ""}
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
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-primary">R$ {unitValue.toFixed(2)}</td>
        <td className="px-3 py-2">
          <Select
            value={status}
            onValueChange={(v) => {
              const value = v as OrderStatus;
              setStatus(value);
              saveOrder({ status: value });
            }}
          >
            <SelectTrigger size="sm" className={cn("h-8 w-32", STATUS_COLOR[status])}>
              <SelectValue>{(v: string) => STATUS_LABEL[v as OrderStatus]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value} className={STATUS_COLOR[value as OrderStatus]}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-3 py-2">
          {isInfinitePay ? (
            <span className="text-sm text-muted-foreground">InfinitePay</span>
          ) : (
            <Select
              value={paymentMethod || undefined}
              onValueChange={(v) => {
                const value = v as PaymentMethod;
                setPaymentMethod(value);
                saveOrder({ payment_method: value });
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-36">
                <SelectValue placeholder="—">
                  {(v: string) => (v ? PAYMENT_METHOD_LABEL[v as PaymentMethod] : "—")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MANUAL_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABEL[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={9} className="px-3 py-1 text-xs text-destructive">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

interface NewParticipant {
  name: string;
  birth_date: string;
  gender: Gender;
  shirt_size: ShirtSize;
  church_id: string;
}

function emptyParticipant(): NewParticipant {
  return { name: "", birth_date: "", gender: "MALE", shirt_size: "M", church_id: "" };
}

function NewOrderForm({
  churches,
  batches,
  onCreated,
}: {
  churches: Church[];
  batches: AdminBatch[];
  onCreated: () => void;
}) {
  const [participants, setParticipants] = useState<NewParticipant[]>([emptyParticipant()]);
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState<"PENDING" | "PAID" | "EXEMPT">("PAID");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX_MANUAL");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(index: number, patch: Partial<NewParticipant>) {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      await apiFetch("/api/admin/orders", {
        method: "POST",
        body: JSON.stringify({
          participants,
          batch_id: batchId || undefined,
          status,
          payment_method: status === "PAID" ? paymentMethod : undefined,
        }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o pedido.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Novo pedido manual</DialogTitle>
        <DialogDescription>
          Cadastro feito pelo admin — não passa pela InfinitePay.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Lote</Label>
          <Select value={batchId || undefined} onValueChange={(v) => setBatchId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lote vigente">
                {(v: string) => batches.find((b) => b.id === v)?.name ?? "Lote vigente"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) =>
                  ({ PAID: "Pago", PENDING: "Pendente", EXEMPT: "Isento" })[v] ?? v
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="EXEMPT">Isento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {status === "PAID" && (
          <div className="flex flex-col gap-1.5">
            <Label>Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) => PAYMENT_METHOD_LABEL[v as PaymentMethod]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MANUAL_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABEL[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {participants.map((participant, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground/80">Participante {index + 1}</p>
              {participants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setParticipants((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Nome"
              value={participant.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <BirthDateSelect
              value={participant.birth_date}
              onChange={(v) => update(index, { birth_date: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={participant.gender}
                onValueChange={(v) => update(index, { gender: v as Gender })}
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
              <Select
                value={participant.shirt_size}
                onValueChange={(v) => update(index, { shirt_size: v as ShirtSize })}
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
            <div className="grid grid-cols-1 gap-3">
              <Select
                value={participant.church_id || undefined}
                onValueChange={(v) => v && update(index, { church_id: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Igreja">
                    {(v: string) => churches.find((c) => c.id === v)?.name ?? "Igreja"}
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
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setParticipants((prev) => [...prev, emptyParticipant()])}
      >
        <Plus className="size-4" data-icon="inline-start" />
        Adicionar participante
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="ghost" />}>Cancelar</DialogClose>
        <Button type="button" disabled={pending} onClick={handleSubmit}>
          {pending ? "Criando..." : "Criar pedido"}
        </Button>
      </DialogFooter>
    </div>
  );
}
