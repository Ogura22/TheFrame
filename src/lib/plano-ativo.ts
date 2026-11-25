import { createClient } from "@/lib/supabase/client";
import type { PlanoDb } from "@/lib/db-types";

/**
 * Plano que rege a próxima reserva/remarcação do cliente nesta clínica:
 * o plano da assinatura ativa dele, ou o "Avulso" da clínica se não tiver
 * assinatura nenhuma.
 */
export async function getPlanoAtivo(
  clinicaId: string,
  clienteId: string
): Promise<PlanoDb | null> {
  const supabase = createClient();

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("plano_id, planos(*)")
    .eq("cliente_id", clienteId)
    .eq("status", "ativa")
    .maybeSingle();

  const planoAssinatura = (assinatura as unknown as { planos: PlanoDb | null } | null)
    ?.planos;
  if (planoAssinatura) return planoAssinatura;

  const { data: avulso } = await supabase
    .from("planos")
    .select("*")
    .eq("clinica_id", clinicaId)
    .eq("tipo", "avulso")
    .maybeSingle();

  return avulso ?? null;
}
