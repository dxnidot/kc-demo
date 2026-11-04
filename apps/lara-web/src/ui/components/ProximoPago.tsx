import type { ReactNode } from "react";
import type { EventoCalendario } from "../../domain/EventoCalendario";
import { enmascarar, fechaConDiaSemana, textoEnDias } from "../finanzasFormato";

interface ProximoPagoProps {
  /** Próximo evento de tipo PAGO, con ultimos4 y diasRestantes ya calculados por el servicio; sin él se
   * muestra que no hay pagos próximos. */
  evento?: EventoCalendario;
  /** Acción del bloque ("Ver calendario"). */
  accion?: ReactNode;
}

/** Clases del botón "ghost" sobre el bloque destacado: borde y texto de tinta, foco con la tinta (no con accent). */
export const claseBotonSobreResaltado =
  "inline-flex min-h-11 items-center justify-center rounded-pill border border-highlight-muted px-4 text-sm font-semibold text-highlight-ink transition-colors hover:bg-highlight-muted/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight-ink";

/**
 * Bloque destacado de "Próximo pago" (Resumen y Tarjetas y pagos): alias, ••••, fecha y "en N días".
 * @author Daniel Tovar
 * @since 2026-10-10
 * @modified Daniel Tovar 2026-10-11 FIN-17: usa evento.ultimos4 y evento.diasRestantes del servicio
 * (ya no recibe la tarjeta ni "hoy" para calcularlos en el front).
 */
export function ProximoPago({ evento, accion }: ProximoPagoProps) {
  return (
    <section
      aria-label="Próximo pago"
      className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-highlight px-5 py-4.5 text-highlight-ink"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-label font-semibold uppercase text-highlight-muted">Próximo pago</span>
        {evento ? (
          <>
            <span className="text-xl font-semibold">
              {evento.alias}
              <span className="ml-2 font-mono text-body font-medium">{enmascarar(evento.ultimos4)}</span>
            </span>
            <span className="num text-sm text-highlight-muted">
              {fechaConDiaSemana(evento.fecha)} · {textoEnDias(evento.diasRestantes)}
            </span>
          </>
        ) : (
          <>
            <span className="text-xl font-semibold">Sin pagos próximos</span>
            <span className="text-sm text-highlight-muted">No hay pagos en los próximos 30 días.</span>
          </>
        )}
      </div>
      {accion}
    </section>
  );
}
