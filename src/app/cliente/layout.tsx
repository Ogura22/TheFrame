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
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (perfil?.tipo !== "cliente") redirect("/");

  // V1: a plataforma opera com uma clínica por enquanto — assume que o
  // cliente reserva sempre na primeira clínica cadastrada. Quando houver
  // mais de uma, isso vira uma tela de escolha antes daqui.
  const { data: clinica } = await supabase
    .from("clinicas")
    .select("id, nome")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!clinica) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Nenhuma clínica cadastrada na plataforma ainda. Peça para o Super
        Admin cadastrar uma clínica antes de reservar.
      </div>
    );
  }

  return (
    <ClienteShell clinicaId={clinica.id} clinicaNome={clinica.nome}>
      {children}
    </ClienteShell>
  );
}
