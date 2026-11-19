"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FieldBox } from "@/components/field-box";
import { TimeRangeSlider } from "@/components/time-range-slider";
import { ItemsCatalog, type CatalogItem } from "@/components/items-catalog";
import { TermsGateDialog } from "@/components/terms-acceptance";
import { useCart } from "@/lib/cart-context";
import { useReservation } from "@/lib/reservation-context";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDuracao, gerarSlots } from "@/lib/mock-data";
import type { ItemDb, SalaDb } from "@/lib/db-types";

const COMISSAO_PCT = 0.08;
const TAXA_GATEWAY_PCT = 0.0299;
const HORARIOS = gerarSlots("07:00", "24:00", 30);
const PLACEHOLDER_IMG = "https://picsum.photos/seed/item-sem-foto/300/300";

function horasEntre(a: string, b: string) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function paraCatalogo(item: ItemDb): CatalogItem {
  return {
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    preco: item.preco,
    estoque: item.estoque,
    imagem: item.imagem_url ?? PLACEHOLDER_IMG,
  };
}

export default function ClientePage() {
  const { clinicaId, clinicaNome } = useClinica();
  const {
    data,
    setData,
    salaId,
    setSalaId,
    range,
    setRange,
    abrirCheckout,
    limparSolicitacaoCheckout,
    reset: resetReserva,
  } = useReservation();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [termosOpen, setTermosOpen] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { cart: itemsCart, setQty: setItemQty, clear: clearCart } = useCart();

  const [salas, setSalasState] = useState<SalaDb[]>([]);
  const [itens, setItens] = useState<ItemDb[]>([]);
  const [bloqueados, setBloqueados] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("salas").select("*").eq("clinica_id", clinicaId).order("created_at"),
      supabase.from("itens").select("*").eq("clinica_id", clinicaId).order("created_at"),
    ]).then(([salasRes, itensRes]) => {
      const listaSalas = salasRes.data ?? [];
      setSalasState(listaSalas);
      setItens(itensRes.data ?? []);
      if (!salaId && listaSalas[0]) setSalaId(listaSalas[0].id);
    });
  }, [clinicaId, salaId, setSalaId]);

  useEffect(() => {
    if (!salaId || !data) return;
    const supabase = createClient();
    supabase
      .from("reservas")
      .select("hora_inicio, hora_fim")
      .eq("sala_id", salaId)
      .eq("dia", toISODate(data))
      .neq("status", "cancelada")
      .then(({ data: ocupadas }) => {
        const slotsOcupados = new Set<string>();
        for (const r of ocupadas ?? []) {
          const inicioIdx = HORARIOS.indexOf(r.hora_inicio.slice(0, 5));
          const fimIdx = HORARIOS.indexOf(r.hora_fim.slice(0, 5));
          for (let i = inicioIdx; i < (fimIdx === -1 ? HORARIOS.length : fimIdx); i++) {
            slotsOcupados.add(HORARIOS[i]);
          }
        }
        setBloqueados([...slotsOcupados]);
        setRange(null);
      });
  }, [salaId, data, setRange]);

  useEffect(() => {
    if (abrirCheckout) {
      setConfirmModalOpen(true);
      limparSolicitacaoCheckout();
    }
  }, [abrirCheckout, limparSolicitacaoCheckout]);

  function abrirConfirmacao() {
    setConfirmModalOpen(true);
  }

  const sala = useMemo(() => salas.find((s) => s.id === salaId), [salas, salaId]);

  const horas = range ? horasEntre(range[0], range[1]) : 0;
  const valorBase = horas * (sala?.valor_hora ?? 0);
  const comissao = valorBase * COMISSAO_PCT;
  const taxaGateway = valorBase * TAXA_GATEWAY_PCT;
  const total = valorBase + comissao + taxaGateway;

  const itensSelecionados = useMemo(
    () =>
      Object.entries(itemsCart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ item: itens.find((i) => i.id === id)!, qty }))
        .filter((e) => e.item),
    [itemsCart, itens]
  );
  const itensTotal = itensSelecionados.reduce(
    (acc, { item, qty }) => acc + item.preco * qty,
    0
  );
  const totalGeral = total + itensTotal;

  async function finalizarReserva() {
    if (!sala || !data || !range) return;
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErro("Sessão expirada. Faça login de novo.");
      setEnviando(false);
      return;
    }

    const { data: reserva, error: erroReserva } = await supabase
      .from("reservas")
      .insert({
        clinica_id: clinicaId,
        cliente_id: user.id,
        sala_id: sala.id,
        dia: toISODate(data),
        hora_inicio: range[0],
        hora_fim: range[1],
        valor: valorBase,
        status: "confirmada",
        pago: true,
      })
      .select("id")
      .single();

    if (erroReserva || !reserva) {
      setErro("Não foi possível confirmar a reserva. Tente outro horário.");
      setEnviando(false);
      return;
    }

    if (itensSelecionados.length > 0) {
      await supabase.from("reserva_itens").insert(
        itensSelecionados.map(({ item, qty }) => ({
          reserva_id: reserva.id,
          item_id: item.id,
          quantidade: qty,
          preco_unitario: item.preco,
        }))
      );
    }

    setEnviando(false);
    setConfirmModalOpen(false);
    setConfirmado(true);
    clearCart();
    resetReserva();
  }

  if (confirmado) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <Badge className="mb-4">Reserva confirmada</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tudo certo!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Você vai receber a confirmação pelo WhatsApp com horário, sala e
          endereço completo.
        </p>
        <Button className="mt-8" onClick={() => setConfirmado(false)}>
          Fazer nova reserva
        </Button>
      </div>
    );
  }

  if (salas.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Essa clínica ainda não cadastrou nenhuma sala disponível para reserva.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clinicaNome}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Checkout automático
        </Badge>
      </div>

      <div className="mt-6 space-y-3">
        <FieldBox label="Sala" icon={<ChevronDown className="size-4 text-muted-foreground" />}>
          <Select value={salaId} onValueChange={(v) => v && setSalaId(v)}>
            <SelectTrigger className="h-auto w-full border-none p-0 shadow-none focus-visible:ring-0 [&>svg]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {salas.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} · {formatCurrency(s.valor_hora)}/h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBox>

        <Popover>
          <PopoverTrigger
            render={
              <button type="button" className="w-full text-left">
                <FieldBox
                  label="Data"
                  icon={
                    <CalendarIcon className="size-4 text-muted-foreground" />
                  }
                >
                  {data
                    ? data.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Selecionar data"}
                </FieldBox>
              </button>
            }
          />
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data}
              onSelect={setData}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        <div className="grid grid-cols-2 gap-3">
          <FieldBox label="Hora início">{range?.[0] ?? "—"}</FieldBox>
          <FieldBox label="Hora fim">{range?.[1] ?? "—"}</FieldBox>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Horários</p>
        <TimeRangeSlider
          slots={HORARIOS}
          blocked={bloqueados}
          value={range}
          onChange={setRange}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Toque em um horário para iniciar e em outro para concluir a seleção.
          Os valores são somados automaticamente.
        </p>
      </div>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duração</span>
            <span>{horas > 0 ? formatDuracao(horas) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Valor ({formatCurrency(sala?.valor_hora ?? 0)}/h)
            </span>
            <span>{formatCurrency(valorBase)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Comissão plataforma (8%)</span>
            <span>{formatCurrency(comissao)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxa gateway (2,99%)</span>
            <span>{formatCurrency(taxaGateway)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 shadow-[0_-4px_16px_-8px_rgb(0_0_0_/_0.15)] backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
          <Button size="lg" disabled={!range} onClick={abrirConfirmacao}>
            Reservar
          </Button>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noreferrer"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm"
          >
            <MessageCircle className="size-5" />
          </a>
        </div>
      </div>

      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
            <DialogDescription>
              Revise os dados, adicione itens se precisar e conclua o
              pagamento automático.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sala</span>
              <span>{sala?.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário</span>
              <span>
                {range?.[0]}–{range?.[1]} ({formatDuracao(horas)})
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-muted-foreground">
              <span>Locação da sala</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {itensTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Itens adicionados</span>
                <span>{formatCurrency(itensTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Total a pagar</span>
              <span>{formatCurrency(totalGeral)}</span>
            </div>

            {itensSelecionados.length > 0 && (
              <ul className="space-y-1 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {itensSelecionados.map(({ item, qty }) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {qty}x {item.nome}
                    </span>
                    <span>{formatCurrency(item.preco * qty)}</span>
                  </li>
                ))}
              </ul>
            )}

            <Separator />

            <div>
              <p className="mb-2 font-medium">
                Deseja adicionar algum item? (opcional)
              </p>
              <ItemsCatalog
                itens={itens.map(paraCatalogo)}
                cart={itemsCart}
                onQtyChange={setItemQty}
                compact
              />
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>

          <DialogFooter>
            <Button onClick={() => setTermosOpen(true)}>
              Seguir com a confirmação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TermsGateDialog
        open={termosOpen}
        onOpenChange={setTermosOpen}
        onConfirm={finalizarReserva}
        confirmLabel={enviando ? "Confirmando..." : "Confirmar e pagar"}
      />
    </div>
  );
}
