"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/mock-data";
import {
  comissaoLabelPorTipoDb,
  tiposPlanoInfoDb,
  type ItemDb,
  type PlanoDb,
  type SalaDb,
  type TipoPlanoDb,
} from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";

const diasSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function NovoPlanoDialog({
  open,
  onOpenChange,
  tiposHabilitados,
  salas,
  itens,
  onCriar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tiposHabilitados: TipoPlanoDb[];
  salas: SalaDb[];
  itens: ItemDb[];
  onCriar: (dados: Omit<PlanoDb, "id" | "clinica_id" | "created_at">) => void;
}) {
  const tiposCriaveis = tiposHabilitados.filter((t) => t !== "avulso");
  const [tipo, setTipo] = useState<TipoPlanoDb>(tiposCriaveis[0] ?? "flex");
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [horasIncluidas, setHorasIncluidas] = useState("");
  const [diaSemana, setDiaSemana] = useState(diasSemana[0]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("12:00");
  const [sala, setSala] = useState(salas[0]?.nome ?? "");
  const [itensInclusosIds, setItensInclusosIds] = useState<string[]>([]);

  function limpar() {
    setNome("");
    setValor("");
    setHorasIncluidas("");
    setItensInclusosIds([]);
  }

  function toggleItem(id: string) {
    setItensInclusosIds((atual) =>
      atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id]
    );
  }

  function handleCriar() {
    if (!nome.trim() || !valor) return;
    onCriar({
      tipo,
      nome: nome.trim(),
      valor: Number(valor) || 0,
      horas_incluidas: tipo === "flex" ? Number(horasIncluidas) || 0 : null,
      recorrencia: tipo === "fixo" ? { diaSemana, horaInicio, horaFim, sala } : null,
      itens_inclusos_ids: itensInclusosIds.length ? itensInclusosIds : null,
      ativo: true,
    });
    limpar();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) limpar();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo plano</DialogTitle>
          <DialogDescription>
            Disponível para os clientes desta clínica assinarem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo de plano</Label>
            <Select value={tipo} onValueChange={(v) => v && setTipo(v as TipoPlanoDb)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: TipoPlanoDb) => tiposPlanoInfoDb[v]?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tiposCriaveis.map((t) => (
                  <SelectItem key={t} value={t}>
                    {tiposPlanoInfoDb[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plano-nome">Nome</Label>
            <Input
              id="plano-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Flex 10h/mês"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plano-valor">Valor mensal (R$)</Label>
            <Input
              id="plano-valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>

          {tipo === "flex" && (
            <div className="space-y-1.5">
              <Label htmlFor="plano-horas">Horas incluídas por mês</Label>
              <Input
                id="plano-horas"
                type="number"
                value={horasIncluidas}
                onChange={(e) => setHorasIncluidas(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {tipo === "fixo" && (
            <>
              <div className="space-y-1.5">
                <Label>Dia da semana</Label>
                <Select value={diaSemana} onValueChange={(v) => v && setDiaSemana(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="plano-inicio">Hora início</Label>
                  <Input
                    id="plano-inicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plano-fim">Hora fim</Label>
                  <Input
                    id="plano-fim"
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Sala</Label>
                <Select value={sala} onValueChange={(v) => v && setSala(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.nome}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Itens inclusos neste plano (opcional)</Label>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border p-2">
              {itens.map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={itensInclusosIds.includes(i.id)}
                    onChange={() => toggleItem(i.id)}
                  />
                  {i.nome}
                </label>
              ))}
              {itens.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Cadastre itens na aba Estoque para oferecê-los aqui.
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Comissão da plataforma: {comissaoLabelPorTipoDb(tipo)}
          </p>
        </div>

        <DialogFooter>
          <Button disabled={!nome.trim() || !valor} onClick={handleCriar}>
            Criar plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlanosTab() {
  const { clinicaId } = useClinica();
  const [lista, setLista] = useState<PlanoDb[]>([]);
  const [salas, setSalas] = useState<SalaDb[]>([]);
  const [itens, setItens] = useState<ItemDb[]>([]);
  const [tiposHabilitados, setTiposHabilitados] = useState<TipoPlanoDb[]>(["avulso"]);
  const [carregando, setCarregando] = useState(true);
  const [novoOpen, setNovoOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("planos").select("*").eq("clinica_id", clinicaId).order("created_at"),
      supabase.from("salas").select("*").eq("clinica_id", clinicaId),
      supabase.from("itens").select("*").eq("clinica_id", clinicaId),
      supabase.from("clinicas").select("tipos_plano_habilitados").eq("id", clinicaId).single(),
    ]).then(([planosRes, salasRes, itensRes, clinicaRes]) => {
      setLista(planosRes.data ?? []);
      setSalas(salasRes.data ?? []);
      setItens(itensRes.data ?? []);
      setTiposHabilitados(clinicaRes.data?.tipos_plano_habilitados ?? ["avulso"]);
      setCarregando(false);
    });
  }, [clinicaId]);

  async function criar(dados: Omit<PlanoDb, "id" | "clinica_id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("planos")
      .insert({ ...dados, clinica_id: clinicaId })
      .select("*")
      .single();
    if (!error && data) setLista((l) => [...l, data]);
  }

  async function remover(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("planos").delete().eq("id", id);
    if (!error) setLista((l) => l.filter((p) => p.id !== id));
  }

  const podeCriar = tiposHabilitados.some((t) => t !== "avulso");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Planos</CardTitle>
          <CardDescription>
            Tipos liberados pela plataforma para esta clínica:{" "}
            {tiposHabilitados.map((t) => tiposPlanoInfoDb[t].label).join(", ")}.
          </CardDescription>
        </div>
        {podeCriar && (
          <Button size="sm" onClick={() => setNovoOpen(true)}>
            <Plus className="size-4" />
            Novo plano
          </Button>
        )}
      </CardHeader>
      <CardContent className="divide-y">
        {carregando && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Carregando...
          </p>
        )}
        {!carregando &&
          lista.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{p.nome}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {tiposPlanoInfoDb[p.tipo].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.valor === 0 ? "Sem mensalidade" : `${formatCurrency(p.valor)}/mês`}
                  {p.horas_incluidas && ` · ${p.horas_incluidas}h incluídas`}
                  {p.recorrencia &&
                    ` · ${p.recorrencia.diaSemana} ${p.recorrencia.horaInicio}–${p.recorrencia.horaFim}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comissão: {comissaoLabelPorTipoDb(p.tipo)}
                </p>
                {p.itens_inclusos_ids && p.itens_inclusos_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Itens inclusos:{" "}
                    {p.itens_inclusos_ids
                      .map((id) => itens.find((i) => i.id === id)?.nome)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              {p.tipo !== "avulso" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remover(p.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        {!carregando && lista.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum plano cadastrado ainda.
          </p>
        )}
      </CardContent>

      <NovoPlanoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        tiposHabilitados={tiposHabilitados}
        salas={salas}
        itens={itens}
        onCriar={criar}
      />
    </Card>
  );
}
