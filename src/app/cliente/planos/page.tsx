"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  assinaturasClientes,
  clienteLogado,
  comissaoLabelPorTipo,
  formatCurrency,
  itens,
  planos,
  tiposPlanoInfo,
} from "@/lib/mock-data";

export default function PlanosPage() {
  const assinaturaAtual = assinaturasClientes.find(
    (a) => a.clienteNome === clienteLogado && a.status === "ativa"
  );
  const [planoAtivoId, setPlanoAtivoId] = useState(
    assinaturaAtual?.planoId ?? "p-avulso"
  );

  const planosVisiveis = planos.filter((p) => p.ativo);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Planos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The Frame Coworking — Jardins. Escolha como prefere pagar pelas salas.
      </p>

      <div className="mt-6 space-y-3">
        {planosVisiveis.map((p) => {
          const ativo = p.id === planoAtivoId;
          const info = tiposPlanoInfo[p.tipo];
          return (
            <Card
              key={p.id}
              className={cn(ativo && "ring-2 ring-primary ring-offset-0")}
            >
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{p.nome}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {info.label}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {info.descricao}
                  </CardDescription>
                </div>
                {ativo && (
                  <Badge className="shrink-0 gap-1">
                    <Check className="size-3" />
                    Ativo
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">
                  {p.valor === 0 ? "Sem mensalidade" : formatCurrency(p.valor)}
                  {p.valor > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  )}
                </p>
                {p.horasIncluidas && (
                  <p className="text-sm text-muted-foreground">
                    {p.horasIncluidas}h incluídas por mês
                  </p>
                )}
                {p.recorrencia && (
                  <p className="text-sm text-muted-foreground">
                    Toda {p.recorrencia.diaSemana.toLowerCase()},{" "}
                    {p.recorrencia.horaInicio}–{p.recorrencia.horaFim} ·{" "}
                    {p.recorrencia.sala}
                  </p>
                )}
                {p.itensInclusosIds && p.itensInclusosIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Inclui:{" "}
                    {p.itensInclusosIds
                      .map((id) => itens.find((i) => i.id === id)?.nome)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Comissão da plataforma: {comissaoLabelPorTipo(p.tipo)}
                </p>
                {!ativo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    onClick={() => setPlanoAtivoId(p.id)}
                  >
                    {p.tipo === "avulso" ? "Usar avulso" : "Assinar este plano"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assinaturaAtual && planoAtivoId === assinaturaAtual.planoId && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Próxima cobrança em{" "}
          {new Date(
            `${assinaturaAtual.proximaCobrancaISO}T00:00:00`
          ).toLocaleDateString("pt-BR")}
          {assinaturaAtual.horasRestantes !== undefined &&
            ` · ${assinaturaAtual.horasRestantes}h restantes neste ciclo`}
        </p>
      )}
    </div>
  );
}
