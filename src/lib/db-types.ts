// Tipos espelhando o schema do Supabase (supabase/migrations). Mantidos à
// mão por simplicidade neste estágio do projeto — dá pra trocar depois por
// `supabase gen types typescript` quando o schema estabilizar.

export type TipoPerfilDb = "super_admin" | "clinica_admin" | "recepcao" | "cliente";
export type CheckoutTipoDb = "automatico" | "com_confirmacao";
export type StatusReservaDb = "confirmada" | "pendente" | "cancelada";
export type CategoriaItemDb = "material" | "produto" | "conveniencia";
export type TipoPlanoDb = "avulso" | "flex" | "fixo";
export type StatusAssinaturaDb = "ativa" | "cancelada";
export type TipoNotificacaoDb = "reserva" | "material" | "pagamento" | "reagendamento";

export interface ClinicaDb {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  checkout: CheckoutTipoDb;
  tipos_plano_habilitados: TipoPlanoDb[];
  comissao_percentual: number;
  created_at: string;
}

export interface SalaDb {
  id: string;
  clinica_id: string;
  nome: string;
  capacidade: number;
  valor_hora: number;
  created_at: string;
}

export interface PerfilDb {
  id: string;
  tipo: TipoPerfilDb;
  clinica_id: string | null;
  nome: string;
  especialidade: string | null;
  foto_url: string | null;
  cpf: string | null;
  registro_profissional: string | null;
  endereco_cobranca: string | null;
  celular: string | null;
  email: string | null;
  created_at: string;
}

export interface ItemDb {
  id: string;
  clinica_id: string;
  nome: string;
  categoria: CategoriaItemDb;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  created_at: string;
}

export interface ReservaDb {
  id: string;
  clinica_id: string;
  cliente_id: string;
  sala_id: string;
  dia: string;
  hora_inicio: string;
  hora_fim: string;
  valor: number;
  status: StatusReservaDb;
  pago: boolean;
  created_at: string;
}

export interface ReservaItemDb {
  id: string;
  reserva_id: string;
  item_id: string;
  quantidade: number;
  preco_unitario: number;
}

export interface PoliticaCancelamentoDb {
  clinica_id: string;
  horas_antecedencia_gratuita: number;
  percentual_cobrado_fora_prazo: number;
  reagendamento_requer_aprovacao: boolean;
}

export interface NotificacaoDb {
  id: string;
  clinica_id: string;
  tipo: TipoNotificacaoDb;
  titulo: string;
  descricao: string | null;
  lida: boolean;
  created_at: string;
}

export interface PlanoDb {
  id: string;
  clinica_id: string;
  tipo: TipoPlanoDb;
  nome: string;
  valor: number;
  horas_incluidas: number | null;
  recorrencia: {
    diaSemana: string;
    horaInicio: string;
    horaFim: string;
    sala: string;
  } | null;
  itens_inclusos_ids: string[] | null;
  ativo: boolean;
  created_at: string;
}

export interface AssinaturaDb {
  id: string;
  cliente_id: string;
  plano_id: string;
  horas_restantes: number | null;
  status: StatusAssinaturaDb;
  proxima_cobranca: string | null;
  created_at: string;
}

export interface ContratoDb {
  id: string;
  clinica_id: string;
  arquivo_url: string | null;
  texto_modelo: string | null;
  created_at: string;
}

export const categoriasItemDb: Record<CategoriaItemDb, string> = {
  material: "Materiais",
  produto: "Produtos",
  conveniencia: "Conveniência",
};

export const tiposPlanoInfoDb: Record<TipoPlanoDb, { label: string; descricao: string }> = {
  avulso: { label: "Avulso", descricao: "Paga por reserva, sem compromisso mensal." },
  flex: { label: "Flex", descricao: "Pacote de horas mensal com valor/hora reduzido." },
  fixo: { label: "Fixo", descricao: "Assinatura mensal com horário recorrente reservado." },
};

export function comissaoLabelPorTipoDb(tipo: TipoPlanoDb) {
  if (tipo === "fixo") return "Sob consulta";
  return "8% + taxa de gateway, calculada no checkout de cada reserva";
}
