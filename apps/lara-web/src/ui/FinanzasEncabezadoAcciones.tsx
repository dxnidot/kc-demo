import type { Moneda } from "../domain/MovimientoFinanciero";
import { claseFocoInterno } from "./components/foco";
import { SelectorPeriodo } from "./components/SelectorPeriodo";

const monedas: readonly Moneda[] = ["MXN", "USD"];

interface FinanzasEncabezadoAccionesProps {
  moneda: Moneda;
  onCambiarMoneda: (moneda: Moneda) => void;
  onCambiarPeriodo: (periodo: string) => void;
  periodo: string;
}

/**
 * Acciones del encabezado compartidas por las pantallas de Finanzas que dependen del periodo: selector
 * de mes con flechas y alternador de moneda MXN/USD.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasEncabezadoAcciones({
  moneda,
  onCambiarMoneda,
  onCambiarPeriodo,
  periodo,
}: FinanzasEncabezadoAccionesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SelectorPeriodo onCambiar={onCambiarPeriodo} periodo={periodo} />
      <div
        aria-label="Moneda"
        className="inline-flex rounded-pill border border-border p-0.75"
        role="group"
      >
        {monedas.map((opcion) => (
          <button
            aria-pressed={moneda === opcion}
            className={`min-h-11 min-w-11 rounded-pill px-3 font-mono text-xs shell:min-h-7.5 shell:min-w-0 ${claseFocoInterno} ${
              moneda === opcion ? "bg-accent text-accent-ink" : "text-muted"
            }`}
            key={opcion}
            onClick={() => onCambiarMoneda(opcion)}
            type="button"
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}
