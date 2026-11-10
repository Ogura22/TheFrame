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
];

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
