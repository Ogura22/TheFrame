"use client";

import { useState } from "react";
import { List, CalendarDays, Upload, FileText } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AgendaCalendar } from "@/components/agenda-calendar";
import { StockManager } from "@/components/stock-manager";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  reservas,
  termosContratoExemplo,
  type Reserva,
} from "@/lib/mock-data";

function StatusBadge({ status }: { status: Reserva["status"] }) {
  const map = {
    confirmada: { label: "Confirmada", variant: "default" as const },
    pendente: { label: "Pendente", variant: "secondary" as const },
    cancelada: { label: "Cancelada", variant: "destructive" as const },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function ClinicaPage() {
  const [selecionada, setSelecionada] = useState<Reserva | null>(null);
  const [visao, setVisao] = useState<"lista" | "calendario">("calendario");
  const [diaCalendario, setDiaCalendario] = useState(new Date("2026-11-10"));
  const [termosModeloOpen, setTermosModeloOpen] = useState(false);
  const [arquivoTermos, setArquivoTermos] = useState<string | null>(null);

  const faturamentoBruto = reservas.reduce((acc, r) => acc + r.valor, 0);
  const comissao = faturamentoBruto * 0.08;
  const netoClinica = faturamentoBruto - comissao;
  const pendentes = reservas.filter((r) => !r.pago && r.status !== "cancelada");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          The Frame Coworking — Jardins
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Painel da administração da clínica
        </p>
      </div>

      <Tabs defaultValue="agenda" className="mt-8">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="contrato">Contrato</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Reservas das salas
                </CardTitle>
                <CardDescription>
                  Clique em uma reserva para ver materiais solicitados.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-full border bg-muted/50 p-1">
                <button
                  onClick={() => setVisao("calendario")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    visao === "calendario"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarDays className="size-3.5" />
                  Calendário
                </button>
                <button
                  onClick={() => setVisao("lista")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    visao === "lista"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="size-3.5" />
                  Lista
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {visao === "calendario" ? (
                <AgendaCalendar
                  date={diaCalendario}
                  onDateChange={setDiaCalendario}
                  reservas={reservas}
                  onSelect={setSelecionada}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dr(a).</TableHead>
                      <TableHead>Sala</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservas.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => setSelecionada(r)}
                      >
                        <TableCell className="font-medium">{r.dr}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.sala}
                        </TableCell>
                        <TableCell>
                          {new Date(r.dia).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {r.horaInicio}–{r.horaFim}
                        </TableCell>
                        <TableCell>{formatCurrency(r.valor)}</TableCell>
                        <TableCell>{r.pago ? "Sim" : "Não"}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Materiais, produtos e conveniência
              </CardTitle>
              <CardDescription>
                Itens disponíveis para venda no checkout e na aba do cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrato" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Contrato de locação
              </CardTitle>
              <CardDescription>
                Documento apresentado ao cliente para aceite antes da
                confirmação da reserva.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
                  <Upload className="size-4" />
                  Enviar novo contrato (PDF)
                  <input
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) =>
                      setArquivoTermos(e.target.files?.[0]?.name ?? null)
                    }
                  />
                </label>
                <Button
                  variant="outline"
                  onClick={() => setTermosModeloOpen(true)}
                >
                  <FileText className="size-4" />
                  Ver modelo de exemplo
                </Button>
              </div>

              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {arquivoTermos
                  ? `Arquivo atual: ${arquivoTermos}`
                  : "Nenhum contrato próprio enviado ainda — a clínica está usando o modelo de exemplo da plataforma."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Faturamento bruto</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(faturamentoBruto)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Comissão da plataforma (8%)</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(comissao)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Líquido da clínica</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(netoClinica)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pendências de pagamento
              </CardTitle>
              <CardDescription>
                {pendentes.length} reserva(s) aguardando pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dr(a).</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendentes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.dr}</TableCell>
                      <TableCell>
                        {new Date(r.dia).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{formatCurrency(r.valor)}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selecionada}
        onOpenChange={(open) => !open && setSelecionada(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selecionada?.dr}</DialogTitle>
            <DialogDescription>
              {selecionada?.sala} · {selecionada?.horaInicio}–
              {selecionada?.horaFim}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm">
            <p className="font-medium">Materiais solicitados</p>
            {selecionada?.materiais?.length ? (
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {selecionada.materiais.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Nenhum material solicitado.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={termosModeloOpen} onOpenChange={setTermosModeloOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contrato de locação — modelo</DialogTitle>
            <DialogDescription>
              Documento de exemplo da plataforma, usado enquanto a clínica não
              enviar um contrato próprio.
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
