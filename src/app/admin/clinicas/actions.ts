"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CriarClinicaLoginInput {
  clinicaNome: string;
  cnpj: string;
  cidade: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

export interface CriarClinicaLoginResult {
  ok: boolean;
  erro?: string;
}

export async function criarClinicaComLogin(
  input: CriarClinicaLoginInput
): Promise<CriarClinicaLoginResult> {
  // Confere que quem está chamando é mesmo super_admin antes de usar a
  // service role key — a Server Action roda no servidor, mas ainda assim
  // não confiamos em quem a invoca sem checar a sessão.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Sessão expirada. Faça login de novo." };

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", user.id)
    .single();
  if (perfil?.tipo !== "super_admin") {
    return { ok: false, erro: "Só o Super Admin pode criar clínicas." };
  }

  const { data: clinica, error: erroClinica } = await supabase
    .from("clinicas")
    .insert({
      nome: input.clinicaNome,
      cnpj: input.cnpj,
      cidade: input.cidade,
    })
    .select("id")
    .single();

  if (erroClinica || !clinica) {
    return {
      ok: false,
      erro: erroClinica?.message ?? "Não foi possível criar a clínica.",
    };
  }

  const admin = createAdminClient();
  const { error: erroUsuario } = await admin.auth.admin.createUser({
    email: input.adminEmail,
    password: input.adminSenha,
    email_confirm: true,
    user_metadata: {
      nome: input.adminNome,
      tipo: "clinica_admin",
      clinica_id: clinica.id,
    },
  });

  if (erroUsuario) {
    // Reverte a clínica criada para não deixar lixo órfão sem administrador.
    await supabase.from("clinicas").delete().eq("id", clinica.id);
    return { ok: false, erro: erroUsuario.message };
  }

  return { ok: true };
}
