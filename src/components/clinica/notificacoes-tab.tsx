"use client";

import { useState } from "react";
import { CalendarClock, CreditCard, Package, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  notificacoes as notificacoesIniciais,
  type Notificacao,
  type TipoNotificacao,
} from "@/lib/mock-data";

const iconePorTipo: Record<TipoNotificacao, typeof CalendarClock> = {
  reserva: CalendarClock,
  material: Package,
  pagamento: CreditCard,
  reagendamento: RefreshCw,
};

const labelPorTipo: Record<TipoNotificacao, string> = {
  reserva: "Reserva",
  material: "Material",
  pagamento: "Pagamento",
  reagendamento: "Reagendamento",
};

function formatarQuando(iso: string) {
  const data = new Date(iso);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificacoesTab() {
  const [lista, setLista] = useState<Notificacao[]>(notificacoesIniciais);
  const [somenteNaoLidas, setSomenteNaoLidas] = useState(false);

  const visiveis = somenteNaoLidas ? lista.filter((n) => !n.lida) : lista;
  const naoLidas = lista.filter((n) => !n.lida).length;

  function marcarComoLida(id: string) {
    setLista((l) => l.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Notificações</CardTitle>
          <CardDescription>
            Reservas, materiais e pagamentos que precisam da sua atenção.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {naoLidas > 0 && <Badge variant="secondary">{naoLidas} não lida(s)</Badge>}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSomenteNaoLidas((v) => !v)}
          >
            {somenteNaoLidas ? "Ver todas" : "Ver não lidas"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="divide-y">
        {visiveis.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação por aqui.
          </p>
        )}
        {visiveis.map((n) => {
          const Icone = iconePorTipo[n.tipo];
          return (
            <button
              key={n.id}
              onClick={() => marcarComoLida(n.id)}
              className={cn(
                "flex w-full items-start gap-3 py-3 text-left first:pt-0 last:pb-0",
                !n.lida && "font-medium"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  n.lida ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                )}
              >
                <Icone className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm">{n.titulo}</p>
                  <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                    {labelPorTipo[n.tipo]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                  {n.descricao}
                </p>
                <p className="mt-1 text-[11px] font-normal text-muted-foreground">
                  {formatarQuando(n.dataHoraISO)}
                </p>
              </div>
              {!n.lida && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
