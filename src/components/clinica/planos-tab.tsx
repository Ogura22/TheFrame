"use client";

import { useState } from "react";
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
import {
  comissaoLabelPorTipo,
  formatCurrency,
  itens,
  planos as planosIniciais,
  salas,
  tiposPlanoHabilitados,
  tiposPlanoInfo,
  type Plano,
  type TipoPlano,
} from "@/lib/mock-data";

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
  onCriar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (plano: Plano) => void;
}) {
  const tiposCriaveis = tiposPlanoHabilitados.filter((t) => t !== "avulso");
  const [tipo, setTipo] = useState<TipoPlano>(tiposCriaveis[0] ?? "flex");
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [horasIncluidas, setHorasIncluidas] = useState("");
  const [diaSemana, setDiaSemana] = useState(diasSemana[0]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("12:00");
  const [sala, setSala] = useState(salas[0].nome);
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
      id: `plano-${Date.now()}`,
      tipo,
      nome: nome.trim(),
      valor: Number(valor) || 0,
      horasIncluidas:
        tipo === "flex" ? Number(horasIncluidas) || 0 : undefined,
      recorrencia:
        tipo === "fixo"
          ? { diaSemana, horaInicio, horaFim, sala }
          : undefined,
      itensInclusosIds: itensInclusosIds.length ? itensInclusosIds : undefined,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo plano</DialogTitle>
          <DialogDescription>
            Disponível para os clientes desta clínica assinarem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo de plano</Label>
            <Select value={tipo} onValueChange={(v) => v && setTipo(v as TipoPlano)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposCriaveis.map((t) => (
                  <SelectItem key={t} value={t}>
                    {tiposPlanoInfo[t].label}
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
                <label
                  key={i.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={itensInclusosIds.includes(i.id)}
                    onChange={() => toggleItem(i.id)}
                  />
                  {i.nome}
                </label>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Comissão da plataforma: {comissaoLabelPorTipo(tipo)}
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
  const [lista, setLista] = useState<Plano[]>(planosIniciais);
  const [novoOpen, setNovoOpen] = useState(false);

  function remover(id: string) {
    setLista((l) => l.filter((p) => p.id !== id));
  }

  const podeCriar = tiposPlanoHabilitados.some((t) => t !== "avulso");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Planos</CardTitle>
          <CardDescription>
            Tipos liberados pela plataforma para esta clínica:{" "}
            {tiposPlanoHabilitados.map((t) => tiposPlanoInfo[t].label).join(", ")}
            .
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
        {lista.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{p.nome}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {tiposPlanoInfo[p.tipo].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {p.valor === 0 ? "Sem mensalidade" : `${formatCurrency(p.valor)}/mês`}
                {p.horasIncluidas && ` · ${p.horasIncluidas}h incluídas`}
                {p.recorrencia &&
                  ` · ${p.recorrencia.diaSemana} ${p.recorrencia.horaInicio}–${p.recorrencia.horaFim}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Comissão: {comissaoLabelPorTipo(p.tipo)}
              </p>
              {p.itensInclusosIds && p.itensInclusosIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Itens inclusos:{" "}
                  {p.itensInclusosIds
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
      </CardContent>

      <NovoPlanoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        onCriar={(plano) => setLista((l) => [...l, plano])}
      />
    </Card>
  );
}
