import { adaptadores } from "../infrastructure/composition";
import { FinanzasChatPanel } from "./FinanzasChatPanel";

const finanzasPort = adaptadores.finanzas;

/**
 * Pantalla "Chat de Finanzas": el asistente especializado como ruta propia del sidebar (antes era un
 * panel deslizante dentro de la pantalla de Finanzas).
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasChatPage() {
  return <FinanzasChatPanel finanzas={finanzasPort} onImportConfirmed={() => {}} pantallaCompleta />;
}
