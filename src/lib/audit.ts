import { createClient } from "@/lib/supabase/client";

export interface RegistroAceite {
  hashContrato: string;
  dataHoraISO: string;
  userAgent: string;
  ip: string;
}

async function sha256(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// IP real só é visível no servidor — client-side usamos um serviço público
// só para fins de demonstração da trilha de auditoria.
async function obterIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip ?? "indisponível";
  } catch {
    return "indisponível";
  }
}

export async function registrarAceite(
  textoContrato: string
): Promise<RegistroAceite> {
  const [hashContrato, ip] = await Promise.all([sha256(textoContrato), obterIp()]);

  const registro: RegistroAceite = {
    hashContrato,
    dataHoraISO: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip,
  };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("aceites_contrato").insert({
      usuario_id: user.id,
      hash_contrato: registro.hashContrato,
      ip: registro.ip,
      user_agent: registro.userAgent,
    });
  }

  return registro;
}
