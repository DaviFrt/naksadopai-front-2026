"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { apiFetch, type Order, type OrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  EXEMPT: "Isento",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "text-primary",
  PAID: "text-emerald-500",
  EXEMPT: "text-muted-foreground",
  CANCELLED: "text-destructive",
  EXPIRED: "text-destructive/70",
  REFUNDED: "text-destructive/70",
};

export default function MinhasInscricoesPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      apiFetch<Order[]>("/api/orders").then(setOrders);
    }
  }, [user]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16 md:px-6 md:py-20">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">Minhas inscrições</h1>
        <Button render={<Link href="/inscricao" />}>Nova inscrição</Button>
      </div>

      {orders === null && <p className="text-muted-foreground">Carregando...</p>}
      {orders?.length === 0 && (
        <p className="text-muted-foreground">Você ainda não fez nenhuma inscrição.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className={`font-semibold ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </p>
              <p className="font-serif text-lg font-semibold text-primary">
                R$ {Number(order.totalAmount).toFixed(2)}
              </p>
            </div>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
              {order.participants.map((participant) => (
                <li key={participant.id}>{participant.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
