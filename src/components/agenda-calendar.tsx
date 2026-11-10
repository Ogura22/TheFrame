"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  gerarSlots,
  salas,
  type Reserva,
} from "@/lib/mock-data";

const HORAS_GRADE = gerarSlots("07:00", "20:00", 30);
const ROW_HEIGHT = 32; // px por bloco de 30min

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function slotIndex(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return Math.round((h * 60 + m - 7 * 60) / 30);
}

const statusStyles: Record<Reserva["status"], string> = {
  confirmada: "border-primary/30 bg-primary/10 text-primary",
  pendente: "border-amber-400/50 bg-amber-400/15 text-amber-700",
  cancelada:
    "border-destructive/30 bg-destructive/10 text-destructive line-through opacity-60",
};

export function AgendaCalendar({
  date,
  onDateChange,
  reservas,
  onSelect,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  reservas: Reserva[];
  onSelect: (r: Reserva) => void;
}) {
  const diaISO = toISODate(date);
  const doDia = reservas.filter((r) => r.dia === diaISO);

  function mudarDia(delta: number) {
    const novo = new Date(date);
    novo.setDate(novo.getDate() + delta);
    onDateChange(novo);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => mudarDia(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => mudarDia(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-sm font-medium capitalize">
            {date.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDateChange(new Date())}>
          Hoje
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `64px repeat(${salas.length}, minmax(180px, 1fr))`,
            gridTemplateRows: `auto repeat(${HORAS_GRADE.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="sticky top-0 z-10 border-r border-b bg-muted/40" />
          {salas.map((s) => (
            <div
              key={s.id}
              className="sticky top-0 z-10 border-r border-b bg-muted/40 px-3 py-2 text-xs font-medium last:border-r-0"
            >
              {s.nome}
            </div>
          ))}

          {HORAS_GRADE.map((hora, rowIdx) => (
            <div
              key={`time-${hora}`}
              className="flex items-start justify-end border-r border-b px-2 pt-1 text-[11px] text-muted-foreground"
              style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
            >
              {hora.endsWith(":00") ? hora : ""}
            </div>
          ))}

          {salas.map((s, colIdx) =>
            HORAS_GRADE.map((hora, rowIdx) => (
              <div
                key={`${s.id}-${hora}`}
                className="border-r border-b last:border-r-0"
                style={{ gridRow: rowIdx + 2, gridColumn: colIdx + 2 }}
              />
            ))
          )}

          {doDia
            .filter((r) => r.status !== "cancelada")
            .map((r) => {
              const colIdx = salas.findIndex((s) => s.nome === r.sala);
              if (colIdx === -1) return null;
              const startRow = slotIndex(r.horaInicio) + 2;
              const endRow = slotIndex(r.horaFim) + 2;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={cn(
                    "m-0.5 overflow-hidden rounded-md border px-2 py-1 text-left text-[11px] leading-tight shadow-sm transition-opacity hover:opacity-80",
                    statusStyles[r.status]
                  )}
                  style={{
                    gridRow: `${startRow} / ${endRow}`,
                    gridColumn: colIdx + 2,
                  }}
                >
                  <p className="font-medium">{r.dr}</p>
                  <p className="text-muted-foreground">
                    {r.horaInicio}–{r.horaFim} · {formatCurrency(r.valor)}
                  </p>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
