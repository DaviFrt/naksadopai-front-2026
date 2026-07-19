"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

interface DateParts {
  day?: number;
  month?: number;
  year?: number;
}

function parseValue(value: string): DateParts {
  if (!value) return { day: undefined, month: undefined, year: undefined };
  const [year, month, day] = value.split("-").map(Number);
  return { day, month, year };
}

export function BirthDateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Guarda seleções parciais localmente: como o componente é controlado pelo
  // `value` do pai e esse valor só muda quando dia+mês+ano estão completos,
  // sem estado local a 1ª e 2ª seleção "somem" a cada re-render antes da 3ª.
  const [local, setLocal] = useState<DateParts>(() => parseValue(value));

  useEffect(() => {
    setLocal(parseValue(value));
  }, [value]);

  const { day, month, year } = local;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const maxDay = month && year ? daysInMonth(month, year) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function update(patch: DateParts) {
    const next: DateParts = { ...local, ...patch };
    if (next.day && next.month && next.year) {
      next.day = Math.min(next.day, daysInMonth(next.month, next.year));
    }
    setLocal(next);
    if (next.day && next.month && next.year) {
      const dd = String(next.day).padStart(2, "0");
      const mm = String(next.month).padStart(2, "0");
      onChange(`${next.year}-${mm}-${dd}`);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={day ? String(day) : undefined} onValueChange={(v) => v && update({ day: Number(v) })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month ? String(month) : undefined}
        onValueChange={(v) => v && update({ month: Number(v) })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Mês">{(v: string) => MONTHS[Number(v) - 1]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((label, i) => (
            <SelectItem key={label} value={String(i + 1)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year ? String(year) : undefined} onValueChange={(v) => v && update({ year: Number(v) })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
