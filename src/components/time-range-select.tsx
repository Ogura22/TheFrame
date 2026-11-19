"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldBox } from "@/components/field-box";

interface TimeRangeSelectProps {
  slots: string[];
  blocked: string[];
  value: [string, string] | null;
  onChange: (value: [string, string] | null) => void;
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

export function TimeRangeSelect({
  slots,
  blocked,
  value,
  onChange,
}: TimeRangeSelectProps) {
  const blockedSet = new Set(blocked);
  const inicio = value?.[0] ?? null;
  const fim = value?.[1] ?? null;

  // Fins possíveis a partir do início escolhido: continuam aparecendo mesmo
  // depois de um horário ocupado, só ficam desabilitados (não dá pra reservar
  // atravessando uma ocupação, mas o cliente vê que ela existe ali).
  const fimOpcoes: { valor: string; desabilitado: boolean }[] = [];
  if (inicio) {
    const startIdx = slots.indexOf(inicio);
    let passouOcupado = false;
    for (let i = startIdx + 1; i <= slots.length; i++) {
      const valor = slots[i] ?? addMinutes(slots[slots.length - 1], 30);
      fimOpcoes.push({ valor, desabilitado: passouOcupado });
      if (i < slots.length && blockedSet.has(slots[i])) passouOcupado = true;
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <FieldBox label="Hora início">
        <Select
          value={inicio ?? undefined}
          onValueChange={(v) => {
            if (!v) return;
            onChange([v, addMinutes(v, 60)]);
          }}
        >
          <SelectTrigger className="h-auto w-full border-none p-0 shadow-none focus-visible:ring-0 [&>svg]:hidden">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {slots.map((s) => (
              <SelectItem key={s} value={s} disabled={blockedSet.has(s)}>
                {s}
                {blockedSet.has(s) && (
                  <span className="text-muted-foreground"> · ocupado</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldBox>

      <FieldBox label="Hora fim">
        <Select
          value={fim ?? undefined}
          onValueChange={(v) => {
            if (!v || !inicio) return;
            onChange([inicio, v]);
          }}
        >
          <SelectTrigger
            disabled={!inicio}
            className="h-auto w-full border-none p-0 shadow-none focus-visible:ring-0 [&>svg]:hidden"
          >
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {fimOpcoes.map(({ valor, desabilitado }) => (
              <SelectItem key={valor} value={valor} disabled={desabilitado}>
                {valor}
                {desabilitado && (
                  <span className="text-muted-foreground"> · indisponível</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldBox>
    </div>
  );
}
