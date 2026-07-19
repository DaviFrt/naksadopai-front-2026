"use client";

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

function parseValue(value: string) {
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
  const { day, month, year } = parseValue(value);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const maxDay = month && year ? daysInMonth(month, year) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function update(patch: { day?: number; month?: number; year?: number }) {
    const nextDay = patch.day ?? day;
    const nextMonth = patch.month ?? month;
    const nextYear = patch.year ?? year;
    if (nextDay && nextMonth && nextYear) {
      const dd = String(Math.min(nextDay, daysInMonth(nextMonth, nextYear))).padStart(2, "0");
      const mm = String(nextMonth).padStart(2, "0");
      onChange(`${nextYear}-${mm}-${dd}`);
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
