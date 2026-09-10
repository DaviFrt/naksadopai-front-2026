"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  SHIRT_SIZE_LABEL,
  type AvulsaShirtSize,
  type ChurchReport,
  type ChurchReportParticipant,
  type FinancialReport,
  type ShirtOrder,
  type ShirtsReportResponse,
  type ShirtSize,
} from "@/lib/api";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import { downloadChurchPdf, downloadGeneralShirtsPdf, downloadShirtOrdersPdf } from "@/lib/pdf";
import { Loader2, FileDown } from "lucide-react";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  INFINITE_PAY: "InfinitePay",
  PIX_MANUAL: "Pix (manual)",
  CASH: "Dinheiro",
  CARD_MANUAL: "Cartão (manual)",
};

const SHIRT_SIZES: ShirtSize[] = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
const INFANT_SHIRT_SIZES: AvulsaShirtSize[] = [
  "INF2",
  "INF4",
  "INF6",
  "INF8",
  "INF10",
  "INF12",
  "INF14",
];

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function sortByAge(participants: ChurchReportParticipant[]) {
  return [...participants].sort((a, b) => calculateAge(b.birthDate) - calculateAge(a.birthDate));
}

function sumSizes(sizes: Partial<Record<AvulsaShirtSize, number>>): number {
  return Object.values(sizes).reduce<number>((sum, n) => sum + (n ?? 0), 0);
}

export default function AdminReportsPage() {
  const [shirts, setShirts] = useState<ShirtsReportResponse | null>(null);
  const [churches, setChurches] = useState<ChurchReport[] | null>(null);
  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [shirtOrders, setShirtOrders] = useState<ShirtOrder[] | null>(null);
  const [expandedChurch, setExpandedChurch] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ShirtsReportResponse>("/api/admin/reports/shirts").then(setShirts);
    apiFetch<ChurchReport[]>("/api/admin/reports/churches").then(setChurches);
    apiFetch<FinancialReport>("/api/admin/reports/financial").then(setFinancial);
    apiFetch<ShirtOrder[]>("/api/admin/shirt-orders").then(setShirtOrders);
  }, []);

  const maleTotal = shirts ? sumSizes(shirts.total.MALE) : 0;
  const femaleTotal = shirts ? sumSizes(shirts.total.FEMALE) : 0;
  const avulsasMaleTotal = shirts ? sumSizes(shirts.avulsas.MALE) : 0;
  const avulsasFemaleTotal = shirts ? sumSizes(shirts.avulsas.FEMALE) : 0;
  const totalParticipants = shirts
    ? maleTotal + femaleTotal - avulsasMaleTotal - avulsasFemaleTotal
    : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <h1 className="text-2xl font-bold uppercase text-brand-gold">Relatórios</h1>

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-brand-gold bg-brand-gold/10 px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-tan">
          Total de inscritos confirmados (Contando insentos, pagos e com camisa confirmada)
        </p>
        {totalParticipants === null ? (
          <Loader2 className="mt-2 size-6 animate-spin text-brand-gold" />
        ) : (
          <p className="text-5xl font-extrabold text-brand-gold">{totalParticipants}</p>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-tan">Camisas</h2>
          <button
            type="button"
            disabled={!churches || !shirtOrders}
            onClick={() => churches && shirtOrders && downloadGeneralShirtsPdf(churches, shirtOrders)}
            className={`${secondaryButtonClass} flex items-center gap-2 px-4! py-1.5! text-xs! disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <FileDown className="size-3.5" />
            Baixar PDF geral (gráfica)
          </button>
        </div>
        {shirts === null && (
          <div className="flex items-center gap-2 py-6 text-brand-cream/60">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {shirts && (
          <>
            <div className={`${cardClass} grid grid-cols-2 gap-8`}>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                  Masculino — {maleTotal}
                </p>
                <div className="flex flex-col gap-1.5">
                  {SHIRT_SIZES.map((size) => {
                    const avulsas = shirts.avulsas.MALE[size] ?? 0;
                    return (
                      <div key={size} className="flex items-center justify-between text-sm">
                        <span className="text-brand-cream/70">{size}</span>
                        <span className="font-semibold text-brand-gold">
                          {shirts.total.MALE[size] ?? 0}
                          {avulsas > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-brand-cream/50">
                              ({avulsas} avulsa{avulsas === 1 ? "" : "s"})
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {INFANT_SHIRT_SIZES.filter((size) => (shirts.total.MALE[size] ?? 0) > 0).map(
                    (size) => (
                      <div key={size} className="flex items-center justify-between text-sm">
                        <span className="text-brand-cream/70">{SHIRT_SIZE_LABEL[size]}</span>
                        <span className="font-semibold text-brand-gold">
                          {shirts.total.MALE[size]}
                          {(shirts.avulsas.MALE[size] ?? 0) > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-brand-cream/50">
                              ({shirts.avulsas.MALE[size]} avulsa
                              {shirts.avulsas.MALE[size] === 1 ? "" : "s"})
                            </span>
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                  Feminino — {femaleTotal}
                </p>
                <div className="flex flex-col gap-1.5">
                  {SHIRT_SIZES.map((size) => {
                    const avulsas = shirts.avulsas.FEMALE[size] ?? 0;
                    return (
                      <div key={size} className="flex items-center justify-between text-sm">
                        <span className="text-brand-cream/70">{size}</span>
                        <span className="font-semibold text-brand-tan">
                          {shirts.total.FEMALE[size] ?? 0}
                          {avulsas > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-brand-cream/50">
                              ({avulsas} avulsa{avulsas === 1 ? "" : "s"})
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {INFANT_SHIRT_SIZES.filter((size) => (shirts.total.FEMALE[size] ?? 0) > 0).map(
                    (size) => (
                      <div key={size} className="flex items-center justify-between text-sm">
                        <span className="text-brand-cream/70">{SHIRT_SIZE_LABEL[size]}</span>
                        <span className="font-semibold text-brand-tan">
                          {shirts.total.FEMALE[size]}
                          {(shirts.avulsas.FEMALE[size] ?? 0) > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-brand-cream/50">
                              ({shirts.avulsas.FEMALE[size]} avulsa
                              {shirts.avulsas.FEMALE[size] === 1 ? "" : "s"})
                            </span>
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            {avulsasMaleTotal + avulsasFemaleTotal > 0 && (
              <p className="text-xs text-brand-cream/50">
                Total já inclui {avulsasMaleTotal + avulsasFemaleTotal} camiseta
                {avulsasMaleTotal + avulsasFemaleTotal === 1 ? "" : "s"} avulsa
                {avulsasMaleTotal + avulsasFemaleTotal === 1 ? "" : "s"} (fora da inscrição no evento).
              </p>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-tan">Financeiro</h2>
        {financial === null && (
          <div className="flex items-center gap-2 py-6 text-brand-cream/60">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {financial && (
          <>
            <div className={`${cardClass} grid grid-cols-2 gap-4 sm:grid-cols-4`}>
              <div>
                <p className="text-xl font-bold text-brand-gold">
                  R$ {financial.total_paid.toFixed(2)}
                </p>
                <p className="text-xs uppercase text-brand-cream/60">Pago</p>
              </div>
              <div>
                <p className="text-xl font-bold text-brand-tan">
                  R$ {financial.total_pending.toFixed(2)}
                </p>
                <p className="text-xs uppercase text-brand-cream/60">Pendente</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">
                  R$ {financial.total_pending_guest_church.toFixed(2)}
                </p>
                <p className="text-xs uppercase text-brand-cream/60">Pendente Igreja Convidada</p>
              </div>
              <div>
                <p className="text-xl font-bold text-brand-cream">{financial.total_exempt}</p>
                <p className="text-xs uppercase text-brand-cream/60">Isentos</p>
              </div>
            </div>
            <div className={`${cardClass} flex flex-col gap-2`}>
              <p className="text-sm text-brand-cream/70">Por forma de pagamento</p>
              {Object.entries(financial.by_payment_method).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-brand-cream/70">
                    {PAYMENT_METHOD_LABEL[method] ?? method}
                  </span>
                  <span className="text-brand-gold">R$ {amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-tan">Camisetas avulsas</h2>
          <button
            type="button"
            disabled={!shirtOrders || shirtOrders.length === 0}
            onClick={() => shirtOrders && downloadShirtOrdersPdf(shirtOrders)}
            className={`${secondaryButtonClass} flex items-center gap-2 px-4! py-1.5! text-xs! disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <FileDown className="size-3.5" />
            Baixar PDF (conferência)
          </button>
        </div>
        {financial === null && (
          <div className="flex items-center gap-2 py-6 text-brand-cream/60">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {financial && (
          <div className={`${cardClass} grid grid-cols-3 gap-4`}>
            <div>
              <p className="text-xl font-bold text-brand-gold">
                R$ {financial.shirt_orders.total_paid.toFixed(2)}
              </p>
              <p className="text-xs uppercase text-brand-cream/60">Pago</p>
            </div>
            <div>
              <p className="text-xl font-bold text-brand-tan">
                R$ {financial.shirt_orders.total_pending.toFixed(2)}
              </p>
              <p className="text-xs uppercase text-brand-cream/60">Pendente</p>
            </div>
            <div>
              <p className="text-xl font-bold text-brand-cream">
                {financial.shirt_orders.total_exempt}
              </p>
              <p className="text-xs uppercase text-brand-cream/60">Isentos</p>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-tan">Igrejas</h2>
        <div className="flex flex-col gap-3">
          {churches === null && (
            <div className="flex items-center gap-2 py-6 text-brand-cream/60">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}
          {churches?.map((church) => {
            const men = sortByAge(church.participants.filter((p) => p.gender === "MALE"));
            const women = sortByAge(church.participants.filter((p) => p.gender === "FEMALE"));

            return (
              <div key={church.id} className={cardClass}>
                <div className="flex w-full items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedChurch(expandedChurch === church.id ? null : church.id)
                    }
                    className="flex flex-1 items-center justify-between"
                  >
                    <span className="font-semibold text-brand-cream">{church.name}</span>
                    <span className="text-brand-gold">{church.participant_count}</span>
                  </button>
                  <button
                    type="button"
                    title="Baixar PDF"
                    onClick={() => downloadChurchPdf(church)}
                    className="shrink-0 text-brand-cream/50 transition-colors hover:text-brand-gold"
                  >
                    <FileDown className="size-4" />
                  </button>
                </div>
                {expandedChurch === church.id && (
                  <div className="mt-4 grid grid-cols-2 gap-6 border-t border-brand-tan/10 pt-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                        Homens — {men.length}
                      </p>
                      <ul className="flex flex-col gap-1 text-sm text-brand-cream/70">
                        {men.map((p) => (
                          <li key={p.id} className="flex justify-between gap-2">
                            <span>{p.name}</span>
                            <span className="shrink-0 text-brand-cream/40">
                              {calculateAge(p.birthDate)}
                              {p.shirtSize ? ` · ${p.shirtSize}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                        Mulheres — {women.length}
                      </p>
                      <ul className="flex flex-col gap-1 text-sm text-brand-cream/70">
                        {women.map((p) => (
                          <li key={p.id} className="flex justify-between gap-2">
                            <span>{p.name}</span>
                            <span className="shrink-0 text-brand-cream/40">
                              {calculateAge(p.birthDate)}
                              {p.shirtSize ? ` · ${p.shirtSize}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
