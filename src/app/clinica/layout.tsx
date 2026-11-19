import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClinicaProvider } from "@/lib/clinica-context";

export default async function ClinicaLayout({
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

  if (!perfil?.clinica_id || !["clinica_admin", "recepcao"].includes(perfil.tipo)) {
    redirect("/");
  }

  const { data: clinica } = await supabase
    .from("clinicas")
    .select("nome")
    .eq("id", perfil.clinica_id)
    .single();

  return (
    <ClinicaProvider
      clinicaId={perfil.clinica_id}
      clinicaNome={clinica?.nome ?? "Clínica"}
    >
      {children}
    </ClinicaProvider>
  );
}
