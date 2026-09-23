"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  ApiError,
  AVULSA_SHIRT_SIZES,
  SHIRT_SIZE_LABEL,
  type AvulsaShirtSize,
  type Gender,
  type OrderStatus,
  type PaymentMethod,
  type ShirtOrder,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, X, Loader2, Trash2 } from "lucide-react";

const GENDER_LABEL: Record<Gender, string> = { MALE: "Masculino", FEMALE: "Feminino" };
const MANUAL_PAYMENT_METHODS: PaymentMethod[] = ["PIX_MANUAL", "CASH", "CARD_MANUAL"];

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  INFINITE_PAY: "InfinitePay",
  PIX_MANUAL: "Pix (manual)",
  CASH: "Dinheiro",
  CARD_MANUAL: "Cartão (manual)",
};

// Reembolso parcial é exclusivo de inscrição no evento (kit + camisa do
// evento), não se aplica a pedido de camiseta avulsa.
type ShirtOrderStatus = Exclude<OrderStatus, "PARTIALLY_REFUNDED">;

const STATUS_LABEL: Record<ShirtOrderStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  EXEMPT: "Isento",
  SHIRT_CONFIRMED: "Camisa confirmada",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLOR: Record<ShirtOrderStatus, string> = {
  PENDING: "text-brand-tan",
  PAID: "text-emerald-400",
  EXEMPT: "text-muted-foreground",
  SHIRT_CONFIRMED: "text-amber-400",
  CANCELLED: "text-red-400",
  EXPIRED: "text-red-400/70",
  REFUNDED: "text-red-400/70",
};

interface NewItem {
  name: string;
  gender: Gender;
  shirt_size: AvulsaShirtSize;
}

function emptyItem(): NewItem {
  return { name: "", gender: "MALE", shirt_size: "M" };
}

export default function AdminShirtOrdersPage() {
  const [shirtOrders, setShirtOrders] = useState<ShirtOrder[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function load() {
    apiFetch<ShirtOrder[]>("/api/admin/shirt-orders").then(setShirtOrders);
  }

  useEffect(load, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase text-brand-gold">Camisetas avulsas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pedidos de camiseta sem inscrição no evento — ex.: membros da organização.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Novo pedido
          </Button>
          <DialogContent className="max-w-lg">
            <NewShirtOrderForm
              onCreated={() => {
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {shirtOrders === null && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {shirtOrders?.length === 0 && (
          <p className="text-muted-foreground">Nenhum pedido de camiseta avulsa ainda.</p>
        )}
        {shirtOrders?.map((shirtOrder) => (
          <ShirtOrderCard key={shirtOrder.id} shirtOrder={shirtOrder} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

function ShirtOrderCard({
  shirtOrder,
  onChanged,
}: {
  shirtOrder: ShirtOrder;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<ShirtOrderStatus>(shirtOrder.status as ShirtOrderStatus);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    shirtOrder.paymentMethod ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  async function save(patch: { status?: OrderStatus; payment_method?: PaymentMethod }) {
    setError(null);
    try {
      await apiFetch(`/api/admin/shirt-orders/${shirtOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    }
  }

  async function handleDelete() {
    const names = shirtOrder.items.map((item) => item.name).join(", ");
    if (!window.confirm(`Apagar este pedido (${names})? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/api/admin/shirt-orders/${shirtOrder.id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível apagar.");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(v) => {
              const value = v as ShirtOrderStatus;
              setStatus(value);
              // Se for PAID e ainda não houver forma de pagamento escolhida,
              // espera o próximo select em vez de salvar incompleto.
              if (value === "PAID" && !paymentMethod) return;
              save({
                status: value,
                payment_method: value === "PAID" ? paymentMethod || undefined : undefined,
              });
            }}
          >
            <SelectTrigger size="sm" className={`h-8 w-40 ${STATUS_COLOR[status]}`}>
              <SelectValue>{(v: string) => STATUS_LABEL[v as ShirtOrderStatus]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value} className={STATUS_COLOR[value as ShirtOrderStatus]}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {status === "PAID" && (
            <Select
              value={paymentMethod}
              onValueChange={(v) => {
                const value = v as PaymentMethod;
                setPaymentMethod(value);
                save({ status: "PAID", payment_method: value });
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-36">
                <SelectValue placeholder="Pagamento">
                  {(v: string) => (v ? PAYMENT_METHOD_LABEL[v as PaymentMethod] : "Pagamento")}
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
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-primary">
            R$ {Number(shirtOrder.totalAmount).toFixed(2)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {shirtOrder.items.map((item) => (
          <ShirtOrderItemRow
            key={item.id}
            shirtOrderId={shirtOrder.id}
            item={item}
            onChanged={onChanged}
          />
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ShirtOrderItemRow({
  shirtOrderId,
  item,
  onChanged,
}: {
  shirtOrderId: string;
  item: ShirtOrder["items"][number];
  onChanged: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [gender, setGender] = useState<Gender>(item.gender);
  const [shirtSize, setShirtSize] = useState<AvulsaShirtSize>(item.shirtSize);
  const [error, setError] = useState<string | null>(null);

  async function save(patch: { name?: string; gender?: Gender; shirt_size?: AvulsaShirtSize }) {
    setError(null);
    try {
      await apiFetch(`/api/admin/shirt-orders/${shirtOrderId}/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          className="h-8 flex-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== item.name && name.trim() && save({ name })}
        />
        <Select
          value={gender}
          onValueChange={(v) => {
            const value = v as Gender;
            setGender(value);
            save({ gender: value });
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-28">
            <SelectValue>{(v: string) => GENDER_LABEL[v as Gender]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Masculino</SelectItem>
            <SelectItem value="FEMALE">Feminino</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={shirtSize}
          onValueChange={(v) => {
            const value = v as AvulsaShirtSize;
            setShirtSize(value);
            save({ shirt_size: value });
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-24">
            <SelectValue>{(v: string) => SHIRT_SIZE_LABEL[v as AvulsaShirtSize]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AVULSA_SHIRT_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {SHIRT_SIZE_LABEL[size]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NewShirtOrderForm({ onCreated }: { onCreated: () => void }) {
  const [items, setItems] = useState<NewItem[]>([emptyItem()]);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "EXEMPT" | "SHIRT_CONFIRMED">("PAID");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX_MANUAL");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(index: number, patch: Partial<NewItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      await apiFetch("/api/admin/shirt-orders", {
        method: "POST",
        body: JSON.stringify({
          items,
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

  const isComplete = items.length > 0 && items.every((item) => item.name.trim().length > 0);

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Novo pedido de camiseta avulsa</DialogTitle>
        <DialogDescription>
          Ex.: membros da organização comprando só a camiseta, sem se inscrever no evento. Preço
          fixo de R$ 40,00 por camiseta.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) =>
                  ({
                    PAID: "Pago",
                    PENDING: "Pendente",
                    EXEMPT: "Isento",
                    SHIRT_CONFIRMED: "Camisa confirmada",
                  })[v] ?? v
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="EXEMPT">Isento</SelectItem>
              <SelectItem value="SHIRT_CONFIRMED">Camisa confirmada</SelectItem>
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
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground/80">Camiseta {index + 1}</p>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Nome"
              value={item.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={item.gender}
                onValueChange={(v) => v && update(index, { gender: v as Gender })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => GENDER_LABEL[v as Gender]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Feminino</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={item.shirt_size}
                onValueChange={(v) => v && update(index, { shirt_size: v as AvulsaShirtSize })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => SHIRT_SIZE_LABEL[v as AvulsaShirtSize]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {AVULSA_SHIRT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {SHIRT_SIZE_LABEL[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          disabled={!isComplete}
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Adicionar camiseta
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm">
        <span className="text-muted-foreground">
          {items.length} camiseta{items.length === 1 ? "" : "s"} × R$ 40,00
        </span>
        <span className="font-serif text-lg font-bold text-primary">
          R$ {(items.length * 40).toFixed(2)}
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="ghost" />}>Cancelar</DialogClose>
        <Button type="button" disabled={pending || !isComplete} onClick={handleSubmit}>
          {pending ? "Salvando..." : "Criar pedido"}
        </Button>
      </DialogFooter>
    </div>
  );
}
