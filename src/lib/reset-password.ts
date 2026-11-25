import { createClient } from "@/lib/supabase/client";

export async function enviarRedefinicaoSenha(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  return { ok: !error };
}
