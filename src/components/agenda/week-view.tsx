"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gerarSlots } from "@/lib/mock-data";
import {
  adicionarDias,
  inicioDaSemana,
  statusStylesAgenda,
  toISODate,
  type EventoAgenda,
} from "@/lib/agenda-types";

const HORAS_GRADE = gerarSlots("07:00", "20:00", 30);
const ROW_HEIGHT = 28;

function slotIndex(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return Math.round((h * 60 + m - 7 * 60) / 30);
}

export function WeekView({
  date,
  onDateChange,
  eventos,
  onSelect,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  eventos: EventoAgenda[];
  onSelect: (id: string) => void;
}) {
  const inicio = inicioDaSemana(date);
  const dias = Array.from({ length: 7 }, (_, i) => adicionarDias(inicio, i));
  const hoje = toISODate(new Date());

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(adicionarDias(date, -7))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(adicionarDias(date, 7))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-sm font-medium capitalize">
            {dias[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} –{" "}
            {dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
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
            gridTemplateColumns: `56px repeat(7, minmax(120px, 1fr))`,
            gridTemplateRows: `auto repeat(${HORAS_GRADE.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="sticky top-0 z-10 border-r border-b bg-muted/40" />
          {dias.map((d) => {
            const iso = toISODate(d);
            return (
              <div
                key={iso}
                className={cn(
                  "sticky top-0 z-10 border-r border-b bg-muted/40 px-2 py-1.5 text-center text-xs font-medium last:border-r-0",
                  iso === hoje && "bg-primary/10 text-primary"
                )}
              >
                <div className="capitalize">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </div>
                <div className="text-sm">{d.getDate()}</div>
              </div>
            );
          })}

          {HORAS_GRADE.map((hora, rowIdx) => (
            <div
              key={`t-${hora}`}
              className="flex items-start justify-end border-r border-b px-1.5 pt-0.5 text-[10px] text-muted-foreground"
              style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
            >
              {hora.endsWith(":00") ? hora : ""}
            </div>
          ))}

          {dias.map((d, colIdx) =>
            HORAS_GRADE.map((hora, rowIdx) => (
              <div
                key={`${colIdx}-${hora}`}
                className="border-r border-b last:border-r-0"
                style={{ gridRow: rowIdx + 2, gridColumn: colIdx + 2 }}
              />
            ))
          )}

          {dias.map((d, colIdx) => {
            const iso = toISODate(d);
            return eventos
              .filter((e) => e.dia === iso && e.status !== "cancelada")
              .map((e) => {
                const startRow = slotIndex(e.horaInicio) + 2;
                const endRow = slotIndex(e.horaFim) + 2;
                return (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e.id)}
                    className={cn(
                      "m-0.5 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[10px] leading-tight shadow-sm transition-opacity hover:opacity-80",
                      statusStylesAgenda[e.status]
                    )}
                    style={{ gridRow: `${startRow} / ${endRow}`, gridColumn: colIdx + 2 }}
                  >
                    <p className="truncate font-medium">{e.titulo}</p>
                    {e.subtitulo && (
                      <p className="truncate text-muted-foreground">{e.subtitulo}</p>
                    )}
                  </button>
                );
              });
          })}
        </div>
      </div>
    </div>
  );
}
