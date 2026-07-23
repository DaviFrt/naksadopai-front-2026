"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  type ChurchReport,
  type ChurchReportParticipant,
  type FinancialReport,
  type ShirtReport,
  type ShirtSize,
} from "@/lib/api";
import { cardClass } from "@/lib/ui";
import { Loader2 } from "lucide-react";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  INFINITE_PAY: "InfinitePay",
  PIX_MANUAL: "Pix (manual)",
  CASH: "Dinheiro",
  CARD_MANUAL: "Cartão (manual)",
};

const SHIRT_SIZES: ShirtSize[] = ["PP", "P", "M", "G", "GG", "XG", "XGG"];

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

export default function AdminReportsPage() {
  const [shirts, setShirts] = useState<ShirtReport | null>(null);
  const [churches, setChurches] = useState<ChurchReport[] | null>(null);
  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [expandedChurch, setExpandedChurch] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ShirtReport>("/api/admin/reports/shirts").then(setShirts);
    apiFetch<ChurchReport[]>("/api/admin/reports/churches").then(setChurches);
    apiFetch<FinancialReport>("/api/admin/reports/financial").then(setFinancial);
  }, []);

  const maleTotal = shirts
    ? Object.values(shirts.MALE).reduce((sum, n) => sum + (n ?? 0), 0)
    : 0;
  const femaleTotal = shirts
    ? Object.values(shirts.FEMALE).reduce((sum, n) => sum + (n ?? 0), 0)
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <h1 className="text-2xl font-bold uppercase text-brand-gold">Relatórios</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-tan">Camisas</h2>
        {shirts === null && (
          <div className="flex items-center gap-2 py-6 text-brand-cream/60">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {shirts && (
          <div className={`${cardClass} grid grid-cols-2 gap-8`}>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                Masculino — {maleTotal}
              </p>
              <div className="flex flex-col gap-1.5">
                {SHIRT_SIZES.map((size) => (
                  <div key={size} className="flex items-center justify-between text-sm">
                    <span className="text-brand-cream/70">{size}</span>
                    <span className="font-semibold text-brand-gold">{shirts.MALE[size] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-cream/60">
                Feminino — {femaleTotal}
              </p>
              <div className="flex flex-col gap-1.5">
                {SHIRT_SIZES.map((size) => (
                  <div key={size} className="flex items-center justify-between text-sm">
                    <span className="text-brand-cream/70">{size}</span>
                    <span className="font-semibold text-brand-tan">{shirts.FEMALE[size] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            <div className={`${cardClass} grid grid-cols-3 gap-4`}>
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
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChurch(expandedChurch === church.id ? null : church.id)
                  }
                  className="flex w-full items-center justify-between"
                >
                  <span className="font-semibold text-brand-cream">{church.name}</span>
                  <span className="text-brand-gold">{church.participant_count}</span>
                </button>
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
                              {calculateAge(p.birthDate)} · {p.shirtSize}
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
                              {calculateAge(p.birthDate)} · {p.shirtSize}
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
