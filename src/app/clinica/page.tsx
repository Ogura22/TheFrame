"use client";

import { useEffect, useState } from "react";
import { List, CalendarDays, Upload, FileText } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AgendaCalendar } from "@/components/agenda-calendar";
import { StockManager } from "@/components/stock-manager";
import { ClientesTab } from "@/components/clinica/clientes-tab";
import { SalasTab } from "@/components/clinica/salas-tab";
import { PoliticaTab } from "@/components/clinica/politica-tab";
import { NotificacoesTab } from "@/components/clinica/notificacoes-tab";
import { PlanosTab } from "@/components/clinica/planos-tab";
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
import { formatCurrency, termosContratoExemplo } from "@/lib/mock-data";
import type { ItemDb, ReservaDb, ReservaItemDb, SalaDb } from "@/lib/db-types";
import { useClinica } from "@/lib/clinica-context";
import { createClient } from "@/lib/supabase/client";

type ReservaView = ReservaDb & {
  sala: string;
  dr: string;
  materiais: string[];
};

function StatusBadge({ status }: { status: ReservaDb["status"] }) {
  const map = {
    confirmada: { label: "Confirmada", variant: "default" as const },
    pendente: { label: "Pendente", variant: "secondary" as const },
    cancelada: { label: "Cancelada", variant: "destructive" as const },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function ClinicaPage() {
  const { clinicaId, clinicaNome } = useClinica();
  const [reservas, setReservas] = useState<ReservaView[]>([]);
  const [salas, setSalas] = useState<SalaDb[]>([]);
  const [carregandoSalas, setCarregandoSalas] = useState(true);
  const [carregandoReservas, setCarregandoReservas] = useState(true);
  const [selecionada, setSelecionada] = useState<ReservaView | null>(null);
  const [visao, setVisao] = useState<"lista" | "calendario">("calendario");
  const [diaCalendario, setDiaCalendario] = useState(new Date());
  const [termosModeloOpen, setTermosModeloOpen] = useState(false);
  const [arquivoTermos, setArquivoTermos] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      supabase
        .from("salas")
        .select("*")
        .eq("clinica_id", clinicaId)
        .order("created_at")
        .then(({ data }) => {
          setSalas(data ?? []);
          setCarregandoSalas(false);
        });

      const { data } = await supabase
        .from("reservas")
        .select(
          "*, salas(nome), perfis:cliente_id(nome), reserva_itens(quantidade, itens(nome))"
        )
        .eq("clinica_id", clinicaId)
        .order("dia", { ascending: false });

      type Linha = ReservaDb & {
        salas: { nome: string } | null;
        perfis: { nome: string } | null;
        reserva_itens: (Pick<ReservaItemDb, "quantidade"> & {
          itens: Pick<ItemDb, "nome"> | null;
        })[];
      };

      const linhas = (data ?? []) as unknown as Linha[];
      setReservas(
        linhas.map((r) => ({
          ...r,
          sala: r.salas?.nome ?? "Sala",
          dr: r.perfis?.nome ?? "Cliente",
          materiais: r.reserva_itens.map(
            (ri) => `${ri.itens?.nome ?? "Item"} (x${ri.quantidade})`
          ),
        }))
      );
      setCarregandoReservas(false);
    }

    carregar();
  }, [clinicaId]);

  async function criarSala(dados: { nome: string; capacidade: number; valor_hora: number }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("salas")
      .insert({ ...dados, clinica_id: clinicaId })
      .select("*")
      .single();
    if (!error && data) setSalas((l) => [...l, data]);
  }

  async function removerSala(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("salas").delete().eq("id", id);
    if (!error) setSalas((l) => l.filter((s) => s.id !== id));
  }

  const faturamentoBruto = reservas.reduce((acc, r) => acc + r.valor, 0);
  const comissao = faturamentoBruto * 0.08;
  const netoClinica = faturamentoBruto - comissao;
  const pendentes = reservas.filter((r) => !r.pago && r.status !== "cancelada");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{clinicaNome}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Painel da administração da clínica
        </p>
      </div>

      <Tabs defaultValue="agenda" className="mt-8">
        <TabsList className="flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="salas">Salas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="politica">Política</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
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
              {carregandoReservas && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Carregando...
                </p>
              )}
              {!carregandoReservas && visao === "calendario" && (
                <AgendaCalendar
                  date={diaCalendario}
                  onDateChange={setDiaCalendario}
                  salas={salas}
                  reservas={reservas.map((r) => ({
                    id: r.id,
                    dr: r.dr,
                    especialidade: "",
                    sala: r.sala,
                    dia: r.dia,
                    horaInicio: r.hora_inicio.slice(0, 5),
                    horaFim: r.hora_fim.slice(0, 5),
                    valor: r.valor,
                    status: r.status,
                    pago: r.pago,
                    materiais: r.materiais,
                  }))}
                  onSelect={(r) =>
                    setSelecionada(reservas.find((x) => x.id === r.id) ?? null)
                  }
                />
              )}
              {!carregandoReservas && visao === "lista" && (
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
                          {new Date(`${r.dia}T00:00:00`).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {r.hora_inicio.slice(0, 5)}–{r.hora_fim.slice(0, 5)}
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
              {!carregandoReservas && reservas.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma reserva ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salas" className="mt-4">
          <SalasTab
            salas={salas}
            carregando={carregandoSalas}
            onCriar={criarSala}
            onRemover={removerSala}
          />
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

        <TabsContent value="clientes" className="mt-4">
          <ClientesTab />
        </TabsContent>

        <TabsContent value="planos" className="mt-4">
          <PlanosTab />
        </TabsContent>

        <TabsContent value="politica" className="mt-4">
          <PoliticaTab />
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <NotificacoesTab />
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
                        {new Date(`${r.dia}T00:00:00`).toLocaleDateString("pt-BR")}
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
              {selecionada?.sala} · {selecionada?.hora_inicio.slice(0, 5)}–
              {selecionada?.hora_fim.slice(0, 5)}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm">
            <p className="font-medium">Materiais solicitados</p>
            {selecionada?.materiais.length ? (
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
