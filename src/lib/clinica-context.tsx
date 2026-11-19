"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ClinicaContextValue {
  clinicaId: string;
  clinicaNome: string;
}

const ClinicaContext = createContext<ClinicaContextValue | null>(null);

export function ClinicaProvider({
  clinicaId,
  clinicaNome,
  children,
}: ClinicaContextValue & { children: ReactNode }) {
  return (
    <ClinicaContext.Provider value={{ clinicaId, clinicaNome }}>
      {children}
    </ClinicaContext.Provider>
  );
}

export function useClinica() {
  const ctx = useContext(ClinicaContext);
  if (!ctx) throw new Error("useClinica deve ser usado dentro de ClinicaProvider");
  return ctx;
}
