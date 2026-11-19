export type StatusReserva = "confirmada" | "pendente" | "cancelada";

export interface Reserva {
  id: string;
  dr: string;
  especialidade: string;
  sala: string;
  dia: string;
  horaInicio: string;
  horaFim: string;
  valor: number;
  status: StatusReserva;
  pago: boolean;
  materiais?: string[];
}

export const salas = [
  { id: "s1", nome: "Sala 1 — Consultório Odonto", capacidade: 1, valorHora: 50 },
  { id: "s2", nome: "Sala 2 — Consultório HOF", capacidade: 1, valorHora: 65 },
  { id: "s3", nome: "Sala 3 — Procedimentos", capacidade: 2, valorHora: 55 },
];

export function gerarSlots(inicio: string, fim: string, passoMin = 30) {
  const [hIni, mIni] = inicio.split(":").map(Number);
  const [hFim, mFim] = fim.split(":").map(Number);
  const slots: string[] = [];
  let totalMin = hIni * 60 + mIni;
  const fimMin = hFim * 60 + mFim;
  while (totalMin < fimMin) {
    const h = Math.floor(totalMin / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMin % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    totalMin += passoMin;
  }
  return slots;
}

export const reservas: Reserva[] = [
  {
    id: "r1",
    dr: "Dra. Camila Souza",
    especialidade: "Odontologia",
    sala: "Sala 1 — Consultório Odonto",
    dia: "2026-11-10",
    horaInicio: "09:00",
    horaFim: "11:00",
    valor: 240,
    status: "confirmada",
    pago: true,
  },
  {
    id: "r2",
    dr: "Dr. Rafael Lima",
    especialidade: "Harmonização Facial",
    sala: "Sala 2 — Consultório HOF",
    dia: "2026-11-10",
    horaInicio: "14:00",
    horaFim: "17:00",
    valor: 360,
    status: "pendente",
    pago: false,
    materiais: ["Ácido hialurônico 1ml", "Toxina botulínica"],
  },
  {
    id: "r3",
    dr: "Dra. Beatriz Nogueira",
    especialidade: "Odontologia",
    sala: "Sala 3 — Procedimentos",
    dia: "2026-11-11",
    horaInicio: "08:00",
    horaFim: "10:00",
    valor: 220,
    status: "confirmada",
    pago: true,
  },
  {
    id: "r4",
    dr: "Dr. Thiago Alencar",
    especialidade: "Harmonização Facial",
    sala: "Sala 2 — Consultório HOF",
    dia: "2026-11-11",
    horaInicio: "10:30",
    horaFim: "12:00",
    valor: 180,
    status: "cancelada",
    pago: false,
  },
  {
    id: "r5",
    dr: "Dra. Camila Souza",
    especialidade: "Odontologia",
    sala: "Sala 1 — Consultório Odonto",
    dia: "2026-11-12",
    horaInicio: "13:00",
    horaFim: "15:00",
    valor: 240,
    status: "pendente",
    pago: false,
  },
  {
    id: "r6",
    dr: "Dra. Camila Souza",
    especialidade: "Odontologia",
    sala: "Sala 1 — Consultório Odonto",
    dia: "2026-11-25",
    horaInicio: "09:00",
    horaFim: "11:00",
    valor: 240,
    status: "confirmada",
    pago: true,
  },
];

// Cliente logado no protótipo — usado para filtrar "Minhas Reservas".
export const clienteLogado = "Dra. Camila Souza";

export const horariosDisponiveis = gerarSlots("07:00", "24:00", 30);

export const horariosBloqueados = ["09:00", "09:30", "14:00", "14:30", "15:00"];

export interface Clinica {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  salas: number;
  checkout: "automático" | "com confirmação";
  horasLocadas: number;
  faturamentoBruto: number;
  comissaoPlataforma: number;
}

export const clinicas: Clinica[] = [
  {
    id: "c1",
    nome: "The Frame Coworking — Jardins",
    cnpj: "12.345.678/0001-90",
    cidade: "São Paulo, SP",
    salas: 3,
    checkout: "automático",
    horasLocadas: 142,
    faturamentoBruto: 28400,
    comissaoPlataforma: 2272,
  },
  {
    id: "c2",
    nome: "The Frame Coworking — Moema",
    cnpj: "98.765.432/0001-10",
    cidade: "São Paulo, SP",
    salas: 2,
    checkout: "com confirmação",
    horasLocadas: 86,
    faturamentoBruto: 15800,
    comissaoPlataforma: 1264,
  },
  {
    id: "c3",
    nome: "The Frame Coworking — Savassi",
    cnpj: "45.612.378/0001-55",
    cidade: "Belo Horizonte, MG",
    salas: 4,
    checkout: "automático",
    horasLocadas: 201,
    faturamentoBruto: 39200,
    comissaoPlataforma: 3136,
  },
];

export type CategoriaItem = "material" | "produto" | "conveniencia";

export interface Item {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  preco: number;
  estoque: number;
  imagem: string;
}

export const categoriasItem: Record<CategoriaItem, string> = {
  material: "Materiais",
  produto: "Produtos",
  conveniencia: "Conveniência",
};

export const itens: Item[] = [
  {
    id: "i1",
    nome: "Luvas de procedimento (par)",
    categoria: "material",
    preco: 2.5,
    estoque: 420,
    imagem: "https://picsum.photos/seed/luvas/300/300",
  },
  {
    id: "i2",
    nome: "Seringa descartável 5ml",
    categoria: "material",
    preco: 1.8,
    estoque: 300,
    imagem: "https://picsum.photos/seed/seringa/300/300",
  },
  {
    id: "i3",
    nome: "Campo cirúrgico descartável",
    categoria: "material",
    preco: 6.9,
    estoque: 150,
    imagem: "https://picsum.photos/seed/campo/300/300",
  },
  {
    id: "i4",
    nome: "Toxina botulínica 50U",
    categoria: "produto",
    preco: 890,
    estoque: 12,
    imagem: "https://picsum.photos/seed/botox/300/300",
  },
  {
    id: "i5",
    nome: "Ácido hialurônico 1ml",
    categoria: "produto",
    preco: 650,
    estoque: 18,
    imagem: "https://picsum.photos/seed/acido/300/300",
  },
  {
    id: "i6",
    nome: "Fio de sustentação (unidade)",
    categoria: "produto",
    preco: 180,
    estoque: 25,
    imagem: "https://picsum.photos/seed/fio/300/300",
  },
  {
    id: "i7",
    nome: "Café expresso",
    categoria: "conveniencia",
    preco: 6,
    estoque: 60,
    imagem: "https://picsum.photos/seed/cafe/300/300",
  },
  {
    id: "i8",
    nome: "Água mineral 500ml",
    categoria: "conveniencia",
    preco: 5,
    estoque: 80,
    imagem: "https://picsum.photos/seed/agua/300/300",
  },
  {
    id: "i9",
    nome: "Bolo do dia (fatia)",
    categoria: "conveniencia",
    preco: 9,
    estoque: 20,
    imagem: "https://picsum.photos/seed/bolo/300/300",
  },
];

export const termosContratoExemplo = `CONTRATO DE LOCAÇÃO DE SALA — THE FRAME COWORKING (MODELO DE EXEMPLO)

1. OBJETO
O presente contrato tem por objeto a locação, por período determinado em horas, de sala equipada dentro das dependências da clínica, destinada à realização de procedimentos de odontologia e harmonização orofacial pelo(a) LOCATÁRIO(A) profissional devidamente habilitado(a).

2. VIGÊNCIA E HORÁRIO
A locação tem início e término conforme os horários reservados e confirmados através da plataforma, não se estendendo automaticamente além do período contratado.

3. VALORES E PAGAMENTO
O valor da locação é calculado com base no número de horas reservadas multiplicado pelo valor/hora da sala, acrescido da comissão da plataforma e da taxa do método de pagamento, conforme discriminado no resumo da reserva.

4. POLÍTICA DE CANCELAMENTO E REAGENDAMENTO
Cancelamentos ou reagendamentos solicitados com antecedência mínima definida pela clínica não geram custo adicional. Solicitações fora desse prazo poderão estar sujeitas à cobrança integral ou parcial do valor da reserva, conforme política vigente da clínica no momento da reserva.

5. MATERIAIS E ITENS ADQUIRIDOS
Materiais, produtos e itens de conveniência solicitados pelo(a) LOCATÁRIO(A) durante o uso da sala serão cobrados separadamente, conforme valores vigentes no catálogo da clínica.

6. RESPONSABILIDADES
O(A) LOCATÁRIO(A) é responsável pela correta utilização do espaço, equipamentos e materiais disponibilizados, respondendo por danos causados por mau uso.

7. ACEITE
Ao confirmar a reserva, o(a) LOCATÁRIO(A) declara ter lido e concordado integralmente com os termos acima, bem como com a política de cancelamento vigente da clínica.

(Este é um modelo de exemplo para fins de validação do protótipo — o contrato final deverá ser revisado por profissional jurídico antes do uso em produção.)`;

// ---------- Perfil do cliente ----------

export interface ClienteDetalhe {
  nome: string;
  especialidade: string;
  foto: string;
  cpf: string;
  registroProfissional: string;
  enderecoCobranca: string;
  celular: string;
  email: string;
}

export const clientesDetalhe: ClienteDetalhe[] = [
  {
    nome: "Dra. Camila Souza",
    especialidade: "Odontologia",
    foto: "https://picsum.photos/seed/camila/200/200",
    cpf: "123.456.789-00",
    registroProfissional: "CRO-SP 45213",
    enderecoCobranca: "Rua Augusta, 1200, apto 42 — São Paulo, SP",
    celular: "(11) 98888-1234",
    email: "camila.souza@email.com",
  },
  {
    nome: "Dr. Rafael Lima",
    especialidade: "Harmonização Facial",
    foto: "https://picsum.photos/seed/rafael/200/200",
    cpf: "987.654.321-00",
    registroProfissional: "CRM-SP 112233",
    enderecoCobranca: "Av. Paulista, 900, cj 15 — São Paulo, SP",
    celular: "(11) 97777-5678",
    email: "rafael.lima@email.com",
  },
  {
    nome: "Dra. Beatriz Nogueira",
    especialidade: "Odontologia",
    foto: "https://picsum.photos/seed/beatriz/200/200",
    cpf: "456.789.123-00",
    registroProfissional: "CRO-SP 78901",
    enderecoCobranca: "Rua Oscar Freire, 300 — São Paulo, SP",
    celular: "(11) 96666-9012",
    email: "beatriz.nogueira@email.com",
  },
  {
    nome: "Dr. Thiago Alencar",
    especialidade: "Harmonização Facial",
    foto: "https://picsum.photos/seed/thiago/200/200",
    cpf: "321.654.987-00",
    registroProfissional: "CRM-SP 445566",
    enderecoCobranca: "Alameda Santos, 500 — São Paulo, SP",
    celular: "(11) 95555-3456",
    email: "thiago.alencar@email.com",
  },
];

// ---------- Política de cancelamento ----------

export interface PoliticaCancelamento {
  horasAntecedenciaGratuita: number;
  percentualCobradoForaPrazo: number;
  reagendamentoRequerAprovacao: boolean;
}

export const politicaCancelamentoPadrao: PoliticaCancelamento = {
  horasAntecedenciaGratuita: 48,
  percentualCobradoForaPrazo: 100,
  reagendamentoRequerAprovacao: true,
};

// ---------- Notificações ----------

export type TipoNotificacao = "reserva" | "material" | "pagamento" | "reagendamento";

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  dataHoraISO: string;
  lida: boolean;
}

export const notificacoes: Notificacao[] = [
  {
    id: "n1",
    tipo: "reagendamento",
    titulo: "Solicitação de reagendamento",
    descricao: "Dra. Camila Souza pediu para mudar o horário da reserva de 12/11.",
    dataHoraISO: "2026-11-17T14:32:00",
    lida: false,
  },
  {
    id: "n2",
    tipo: "material",
    titulo: "Material just in time solicitado",
    descricao: "Dr. Rafael Lima solicitou Ácido hialurônico 1ml e Toxina botulínica para a reserva de hoje.",
    dataHoraISO: "2026-11-17T09:10:00",
    lida: false,
  },
  {
    id: "n3",
    tipo: "reserva",
    titulo: "Nova reserva confirmada",
    descricao: "Dra. Beatriz Nogueira reservou a Sala 3 para 11/11, 08:00–10:00.",
    dataHoraISO: "2026-11-15T18:05:00",
    lida: true,
  },
  {
    id: "n4",
    tipo: "pagamento",
    titulo: "Pagamento pendente",
    descricao: "A reserva de Dr. Rafael Lima (10/11, 14:00–17:00) ainda não foi paga.",
    dataHoraISO: "2026-11-10T20:00:00",
    lida: true,
  },
];

// ---------- Planos ----------

export type TipoPlano = "avulso" | "flex" | "fixo";

export const tiposPlanoInfo: Record<TipoPlano, { label: string; descricao: string }> = {
  avulso: {
    label: "Avulso",
    descricao: "Paga por reserva, sem compromisso mensal.",
  },
  flex: {
    label: "Flex",
    descricao: "Pacote de horas mensal com valor/hora reduzido.",
  },
  fixo: {
    label: "Fixo",
    descricao: "Assinatura mensal com horário recorrente reservado.",
  },
};

export interface Plano {
  id: string;
  tipo: TipoPlano;
  nome: string;
  valor: number;
  horasIncluidas?: number;
  recorrencia?: {
    diaSemana: string;
    horaInicio: string;
    horaFim: string;
    sala: string;
  };
  itensInclusosIds?: string[];
  ativo: boolean;
}

// Comissão da plataforma por tipo de plano: avulso e flex são calculados
// automaticamente no checkout de cada reserva; fixo é negociado caso a caso.
export function comissaoLabelPorTipo(tipo: TipoPlano) {
  if (tipo === "fixo") return "Sob consulta";
  return "8% + taxa de gateway, calculada no checkout de cada reserva";
}

// Tipos de plano que o Super Admin liberou para esta clínica oferecer.
export const tiposPlanoHabilitados: TipoPlano[] = ["avulso", "flex", "fixo"];

export const planos: Plano[] = [
  {
    id: "p-avulso",
    tipo: "avulso",
    nome: "Avulso",
    valor: 0,
    ativo: true,
  },
  {
    id: "p-flex-10",
    tipo: "flex",
    nome: "Flex 10h/mês",
    valor: 450,
    horasIncluidas: 10,
    ativo: true,
  },
  {
    id: "p-flex-20",
    tipo: "flex",
    nome: "Flex 20h/mês",
    valor: 800,
    horasIncluidas: 20,
    itensInclusosIds: ["i1", "i2"],
    ativo: true,
  },
  {
    id: "p-fixo-terca",
    tipo: "fixo",
    nome: "Fixo terças — Sala 1",
    valor: 900,
    recorrencia: {
      diaSemana: "Terça-feira",
      horaInicio: "09:00",
      horaFim: "12:00",
      sala: "Sala 1 — Consultório Odonto",
    },
    itensInclusosIds: ["i1", "i2", "i7"],
    ativo: true,
  },
];

export interface AssinaturaCliente {
  clienteNome: string;
  planoId: string;
  horasRestantes?: number;
  status: "ativa" | "cancelada";
  proximaCobrancaISO: string;
}

export const assinaturasClientes: AssinaturaCliente[] = [
  {
    clienteNome: "Dra. Camila Souza",
    planoId: "p-flex-10",
    horasRestantes: 4,
    status: "ativa",
    proximaCobrancaISO: "2026-12-01",
  },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDuracao(horas: number) {
  const totalMin = Math.round(horas * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}
