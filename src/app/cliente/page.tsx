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
import { ItemsCatalog } from "@/components/items-catalog";
import { useCart } from "@/lib/cart-context";
import { useReservation } from "@/lib/reservation-context";
import {
  formatCurrency,
  formatDuracao,
  horariosBloqueados,
  horariosDisponiveis,
  itens,
  salas,
  termosContratoExemplo,
} from "@/lib/mock-data";

const COMISSAO_PCT = 0.08;
const TAXA_GATEWAY_PCT = 0.0299;

function horasEntre(a: string, b: string) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
}

export default function ClientePage() {
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
  const [aceite, setAceite] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [termosOpen, setTermosOpen] = useState(false);
  const { cart: itemsCart, setQty: setItemQty, clear: clearCart } = useCart();

  useEffect(() => {
    if (abrirCheckout) {
      setConfirmModalOpen(true);
      limparSolicitacaoCheckout();
    }
  }, [abrirCheckout, limparSolicitacaoCheckout]);

  const sala = useMemo(() => salas.find((s) => s.id === salaId)!, [salaId]);

  const horas = range ? horasEntre(range[0], range[1]) : 0;
  const valorBase = horas * sala.valorHora;
  const comissao = valorBase * COMISSAO_PCT;
  const taxaGateway = valorBase * TAXA_GATEWAY_PCT;
  const total = valorBase + comissao + taxaGateway;

  const itensSelecionados = useMemo(
    () =>
      Object.entries(itemsCart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ item: itens.find((i) => i.id === id)!, qty }))
        .filter((e) => e.item),
    [itemsCart]
  );
  const itensTotal = itensSelecionados.reduce(
    (acc, { item, qty }) => acc + item.preco * qty,
    0
  );
  const totalGeral = total + itensTotal;

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

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The Frame Coworking — Jardins, São Paulo
          </p>
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
                  {s.nome} · {formatCurrency(s.valorHora)}/h
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
          slots={horariosDisponiveis}
          blocked={horariosBloqueados}
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
            <span className="text-muted-foreground">Valor ({formatCurrency(sala.valorHora)}/h)</span>
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
          <Button
            size="lg"
            disabled={!range}
            onClick={() => setConfirmModalOpen(true)}
          >
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
              <span>{sala.nome}</span>
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
                itens={itens}
                cart={itemsCart}
                onQtyChange={setItemQty}
                compact
              />
            </div>

            <label className="flex items-start gap-2 pt-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5"
              />
              Li e estou de acordo com o{" "}
              <button
                type="button"
                onClick={() => setTermosOpen(true)}
                className="font-medium text-foreground underline underline-offset-2"
              >
                contrato de locação da sala
              </button>{" "}
              e com a política de cancelamento da clínica.
            </label>
          </div>

          <DialogFooter>
            <Button
              disabled={!aceite}
              onClick={() => {
                setConfirmModalOpen(false);
                setConfirmado(true);
                clearCart();
                resetReserva();
              }}
            >
              Confirmar e pagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={termosOpen} onOpenChange={setTermosOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contrato de locação — modelo</DialogTitle>
            <DialogDescription>
              Documento de exemplo para validação do protótipo.
            </DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap font-sans text-xs text-muted-foreground">
            {termosContratoExemplo}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
