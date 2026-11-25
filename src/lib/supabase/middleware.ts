import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type TipoPerfil = "super_admin" | "clinica_admin" | "recepcao" | "cliente";

function homeParaTipo(tipo: TipoPerfil) {
  if (tipo === "super_admin") return "/admin";
  if (tipo === "clinica_admin" || tipo === "recepcao") return "/clinica";
  return "/cliente";
}

const PUBLICAS = ["/login", "/cadastro"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Rota de redefinição de senha precisa ficar acessível mesmo sem sessão
  // "normal" — o link do e-mail de recuperação só estabelece a sessão no
  // navegador (client-side), depois que esta resposta já foi enviada.
  if (pathname === "/redefinir-senha") return supabaseResponse;

  // Importante: não rodar lógica entre createServerClient e getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ehRotaPublica = PUBLICAS.includes(pathname);

  if (!user) {
    if (ehRotaPublica) return supabaseResponse;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", user.id)
    .single();

  const tipo = (perfil?.tipo as TipoPerfil) ?? "cliente";
  const home = homeParaTipo(tipo);

  if (pathname === "/" || ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  const areaPermitida =
    (pathname.startsWith("/cliente") && tipo === "cliente") ||
    (pathname.startsWith("/clinica") &&
      ["clinica_admin", "recepcao", "super_admin"].includes(tipo)) ||
    (pathname.startsWith("/admin") && tipo === "super_admin");

  if (
    (pathname.startsWith("/cliente") ||
      pathname.startsWith("/clinica") ||
      pathname.startsWith("/admin")) &&
    !areaPermitida
  ) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
