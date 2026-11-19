export interface RegistroAceite {
  hashContrato: string;
  dataHoraISO: string;
  userAgent: string;
  ip: string;
  usuario: string;
}

async function sha256(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// IP real só é visível no servidor — no protótipo (client-side) usamos um
// serviço público só para fins de demonstração da trilha de auditoria.
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
  textoContrato: string,
  usuario: string
): Promise<RegistroAceite> {
  const [hashContrato, ip] = await Promise.all([
    sha256(textoContrato),
    obterIp(),
  ]);

  const registro: RegistroAceite = {
    hashContrato,
    dataHoraISO: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip,
    usuario,
  };

  // Sem backend ainda: guarda localmente. Quando o Supabase estiver
  // conectado, isso vira um insert na tabela "aceites_contrato".
  try {
    const anteriores = JSON.parse(
      localStorage.getItem("aceites_contrato") ?? "[]"
    );
    localStorage.setItem(
      "aceites_contrato",
      JSON.stringify([...anteriores, registro])
    );
  } catch {
    // localStorage indisponível (ex: modo privado) — segue sem persistir.
  }

  return registro;
}
