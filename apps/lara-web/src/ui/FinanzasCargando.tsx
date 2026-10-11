import { Card } from "./components/Card";
import { AvisoCarga, Esqueleto, EsqueletoTabla } from "./components/Esqueleto";

/**
 * Esqueleto de carga común a las pantallas de Finanzas que dependen del resumen mensual
 * (Resumen, Gastos, Ingresos y Tarjetas y pagos).
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasCargando() {
  return (
    <>
      <AvisoCarga texto="Cargando movimientos, resumen y tarjetas…" />
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 wide:grid-cols-4">
          {Array.from({ length: 4 }, (_, indice) => (
            <Card key={indice}>
              <Esqueleto className="h-4 w-1/2" />
              <Esqueleto className="h-7 w-3/4" />
            </Card>
          ))}
        </div>
        <EsqueletoTabla />
      </div>
    </>
  );
}
