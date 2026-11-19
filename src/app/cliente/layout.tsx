import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteShell } from "@/components/cliente-shell";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo, clinica_id")
    .eq("id", user.id)
    .single();

  if (perfil?.tipo !== "cliente") redirect("/");

  // A clínica do cliente é decidida no cadastro (ver trigger handle_new_user)
  // e gravada no próprio perfil — não depende mais de qual clínica foi
  // criada primeiro no sistema.
  if (!perfil.clinica_id) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a nenhuma clínica. Fale com o
        suporte para resolver isso.
      </div>
    );
  }

  const { data: clinica } = await supabase
    .from("clinicas")
    .select("id, nome")
    .eq("id", perfil.clinica_id)
    .single();

  if (!clinica) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        A clínica vinculada à sua conta não foi encontrada. Fale com o
        suporte.
      </div>
    );
  }

  return (
    <ClienteShell clinicaId={clinica.id} clinicaNome={clinica.nome}>
      {children}
    </ClienteShell>
  );
}
