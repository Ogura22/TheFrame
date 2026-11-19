import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Usa a service role key — tem permissão total e ignora RLS. Nunca importar
// este arquivo em um Client Component; o `server-only` acima garante isso
// (o build falha se algum arquivo de cliente tentar importar este módulo).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
