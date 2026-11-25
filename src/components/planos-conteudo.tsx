"use client";

import { useEffect, useState } from "react";
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
  comissaoLabelPorTipoDb,
  tiposPlanoInfoDb,
  type AssinaturaDb,
  type ItemDb,
  type PlanoDb,
} from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/mock-data";

function proximoMes() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function PlanosConteudo() {
  const { clinicaId } = useClinica();
  const [planos, setPlanos] = useState<PlanoDb[]>([]);
  const [itens, setItens] = useState<ItemDb[]>([]);
  const [assinaturaAtual, setAssinaturaAtual] = useState<AssinaturaDb | null>(null);
  const [planoAtivoId, setPlanoAtivoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [planosRes, itensRes, assinaturaRes] = await Promise.all([
        supabase
          .from("planos")
          .select("*")
          .eq("clinica_id", clinicaId)
          .eq("ativo", true)
          .order("tipo"),
        supabase.from("itens").select("*").eq("clinica_id", clinicaId),
        user
          ? supabase
              .from("assinaturas")
              .select("*")
              .eq("cliente_id", user.id)
              .eq("status", "ativa")
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const listaPlanos = planosRes.data ?? [];
      const avulso = listaPlanos.find((p) => p.tipo === "avulso");

      setPlanos(listaPlanos);
      setItens(itensRes.data ?? []);
      setAssinaturaAtual(assinaturaRes.data ?? null);
      setPlanoAtivoId(assinaturaRes.data?.plano_id ?? avulso?.id ?? null);
      setCarregando(false);
    }

    carregar();
  }, [clinicaId]);

  async function assinar(plano: PlanoDb) {
    setProcessando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProcessando(false);
      return;
    }

    if (assinaturaAtual) {
      await supabase
        .from("assinaturas")
        .update({ status: "cancelada" })
        .eq("id", assinaturaAtual.id);
    }

    if (plano.tipo === "avulso") {
      setAssinaturaAtual(null);
      setPlanoAtivoId(plano.id);
      setProcessando(false);
      return;
    }

    const { data: nova } = await supabase
      .from("assinaturas")
      .insert({
        cliente_id: user.id,
        plano_id: plano.id,
        horas_restantes: plano.horas_incluidas,
        status: "ativa",
        proxima_cobranca: proximoMes(),
      })
      .select("*")
      .single();

    setAssinaturaAtual(nova ?? null);
    setPlanoAtivoId(plano.id);
    setProcessando(false);
  }

  if (carregando) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Carregando...
      </p>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {planos.map((p) => {
          const ativo = p.id === planoAtivoId;
          const info = tiposPlanoInfoDb[p.tipo];
          return (
            <Card key={p.id} className={cn(ativo && "ring-2 ring-primary ring-offset-0")}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{p.nome}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {info.label}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">{info.descricao}</CardDescription>
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
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  )}
                </p>
                {p.horas_incluidas && (
                  <p className="text-sm text-muted-foreground">
                    {p.horas_incluidas}h incluídas por mês
                  </p>
                )}
                {p.recorrencia && (
                  <p className="text-sm text-muted-foreground">
                    Toda {p.recorrencia.diaSemana.toLowerCase()},{" "}
                    {p.recorrencia.horaInicio}–{p.recorrencia.horaFim} · {p.recorrencia.sala}
                  </p>
                )}
                {p.itens_inclusos_ids && p.itens_inclusos_ids.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Inclui:{" "}
                    {p.itens_inclusos_ids
                      .map((id) => itens.find((i) => i.id === id)?.nome)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo de {p.horas_minimas}h por reserva
                  {p.horas_antecedencia_remarcacao !== null &&
                    ` · remarcação grátis até ${p.horas_antecedencia_remarcacao}h antes`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comissão da plataforma: {comissaoLabelPorTipoDb(p.tipo)}
                </p>
                {!ativo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    disabled={processando}
                    onClick={() => assinar(p)}
                  >
                    {p.tipo === "avulso" ? "Usar avulso" : "Assinar este plano"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {planos.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum plano disponível ainda.
          </p>
        )}
      </div>

      {assinaturaAtual && planoAtivoId === assinaturaAtual.plano_id && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Próxima cobrança em{" "}
          {assinaturaAtual.proxima_cobranca &&
            new Date(`${assinaturaAtual.proxima_cobranca}T00:00:00`).toLocaleDateString(
              "pt-BR"
            )}
          {assinaturaAtual.horas_restantes !== null &&
            ` · ${assinaturaAtual.horas_restantes}h restantes neste ciclo`}
        </p>
      )}
    </div>
  );
}
