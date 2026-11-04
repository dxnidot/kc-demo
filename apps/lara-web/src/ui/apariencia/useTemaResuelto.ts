import { useEffect, useState } from "react";
import type { PreferenciaTema } from "../../domain/Apariencia";

const consultaOscuro = "(prefers-color-scheme: dark)";

function resolver(tema: PreferenciaTema): "claro" | "oscuro" {
  if (tema !== "sistema") {
    return tema;
  }
  return typeof window.matchMedia === "function" && window.matchMedia(consultaOscuro).matches
    ? "oscuro"
    : "claro";
}

/**
 * Resuelve "sistema" al tema efectivo (claro/oscuro) siguiendo prefers-color-scheme; claro/oscuro se
 * devuelven tal cual. Para el toggle rápido del pie del sidebar, que necesita saber qué icono mostrar.
 * @author Daniel Tovar
 * @since 2026-11-03
 */
export function useTemaResuelto(tema: PreferenciaTema): "claro" | "oscuro" {
  const [resuelto, setResuelto] = useState(() => resolver(tema));

  useEffect(() => {
    setResuelto(resolver(tema));
    if (tema !== "sistema" || typeof window.matchMedia !== "function") {
      return;
    }
    const lista = window.matchMedia(consultaOscuro);
    const alCambiar = () => setResuelto(resolver(tema));
    lista.addEventListener("change", alCambiar);
    return () => lista.removeEventListener("change", alCambiar);
  }, [tema]);

  return resuelto;
}
