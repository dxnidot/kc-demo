import { useEffect } from "react";

const titulosPorRuta: Record<string, string> = {
  "/chat": "Chat",
  "/estado": "Estado del lab",
  "/agentes": "Agentes",
  "/base-de-datos": "Base de datos",
  "/memoria": "Memoria vectorizada",
  "/herramientas": "Herramientas MCP",
  "/menu-por-rol": "Menú por rol",
  "/usuarios": "Usuarios y roles",
  "/gastos-fijos": "Gastos fijos",
  "/finanzas/resumen": "Finanzas · Resumen",
  "/finanzas/chat": "Finanzas · Chat de Finanzas",
  "/finanzas/gastos": "Finanzas · Gastos",
  "/finanzas/ingresos": "Finanzas · Ingresos",
  "/finanzas/tarjetas": "Finanzas · Tarjetas y pagos",
  "/finanzas/inversiones/mx": "Finanzas · Inversiones",
  "/finanzas/inversiones/usa": "Finanzas · Inversiones",
};

/** Título del documento de una ruta: lo más específico primero y "Lara" al final. */
export function tituloDeRuta(pathname: string): string {
  const titulo = titulosPorRuta[pathname];
  return titulo ? `${titulo} · Lara` : "Lara";
}

/** Mantiene document.title al día para que lectores de pantalla y pestañas del navegador distingan las vistas. */
export function useTituloDocumento(titulo: string): void {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
