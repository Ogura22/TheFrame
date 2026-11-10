"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeRangeSliderProps {
  slots: string[];
  blocked: string[];
  value: [string, string] | null;
  onChange: (value: [string, string] | null) => void;
  stepMin?: number;
}

export function TimeRangeSlider({
  slots,
  blocked,
  value,
  onChange,
  stepMin = 30,
}: TimeRangeSliderProps) {
  const [anchor, setAnchor] = useState<string | null>(null);

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);

  const indexOf = (t: string) => slots.indexOf(t);

  function rangeHasBlocked(a: string, b: string) {
    const [start, end] = [indexOf(a), indexOf(b)].sort((x, y) => x - y);
    for (let i = start; i <= end; i++) {
      if (blockedSet.has(slots[i])) return true;
    }
    return false;
  }

  // Seleção inicial padrão: 1h (dois blocos de 30min), reduzindo para 1
  // bloco só se o seguinte já estiver bloqueado ou não existir.
  function rangeMinima(slot: string): [string, string] {
    const i = indexOf(slot);
    const proximo = slots[i + 1];
    const podeUmaHora = proximo && !blockedSet.has(proximo);
    const fimIndex = podeUmaHora ? i + 2 : i + 1;
    const fim = slots[fimIndex] ?? addMinutes(slot, podeUmaHora ? 60 : stepMin);
    return [slot, fim];
  }

  function selectSlot(slot: string) {
    if (blockedSet.has(slot)) return;

    // Nenhuma seleção em andamento: inicia uma nova a partir deste horário.
    if (!anchor) {
      setAnchor(slot);
      onChange(rangeMinima(slot));
      return;
    }

    // Clicar de novo no início desmarca a seleção.
    if (slot === anchor) {
      setAnchor(null);
      onChange(null);
      return;
    }

    // Intervalo cruzaria um horário bloqueado: recomeça a seleção a partir daqui.
    if (rangeHasBlocked(anchor, slot)) {
      setAnchor(slot);
      onChange(rangeMinima(slot));
      return;
    }

    // Qualquer outro clique estica (ou encolhe) o intervalo a partir da âncora fixa,
    // permitindo quantas horas o cliente quiser enquanto houver disponibilidade.
    const [start, end] = [indexOf(anchor), indexOf(slot)].sort(
      (a, b) => a - b
    );
    const endExclusive = slots[end + 1] ?? addMinutes(slots[end], stepMin);
    onChange([slots[start], endExclusive]);
  }

  function limpar() {
    setAnchor(null);
    onChange(null);
  }

  function isSelected(slot: string) {
    if (!value) return false;
    const [start, end] = value;
    return slot >= start && slot < end;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className="flex min-w-max">
          {slots.map((slot) => {
            const isBlocked = blockedSet.has(slot);
            const selected = isSelected(slot);
            const isAnchor = slot === anchor;
            return (
              <button
                key={slot}
                type="button"
                disabled={isBlocked}
                onClick={() => selectSlot(slot)}
                className={cn(
                  "relative flex h-16 w-14 shrink-0 flex-col items-center justify-end border-r pb-1 text-[11px] transition-colors last:border-r-0",
                  isBlocked &&
                    "cursor-not-allowed bg-[repeating-linear-gradient(135deg,var(--muted)_0px,var(--muted)_4px,transparent_4px,transparent_8px)] text-muted-foreground/50",
                  !isBlocked && selected && "bg-primary text-primary-foreground",
                  !isBlocked &&
                    !selected &&
                    "text-muted-foreground hover:bg-muted",
                  isAnchor && !isBlocked && "ring-2 ring-inset ring-primary"
                )}
              >
                <span>{slot}</span>
              </button>
            );
          })}
        </div>
      </div>
      {anchor && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Início marcado às {anchor} — toque em outro horário para esticar a reserva.</span>
          <button
            type="button"
            onClick={limpar}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}

function addMinutes(time: string, min: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + min;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
