import { EstadoError } from "./components/EstadoError";
import { PageLayout } from "./components/PageLayout";
import { FinanzasCargando } from "./FinanzasCargando";
import { FinanzasEncabezadoAcciones } from "./FinanzasEncabezadoAcciones";
import { textoActualizado } from "./finanzasFormato";
import { FinanzasResumenTab } from "./FinanzasResumenTab";
import { useResumenFinanciero } from "./useResumenFinanciero";

/**
 * Pantalla "Resumen" de Finanzas: próximo pago, gastos por categoría y últimos movimientos.
 * Antes era la pestaña "Resumen" de una sola página; ahora es su propia ruta del sidebar.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasResumenPage() {
  const { cargando, datos, error, hoy, minutos, moneda, periodo, reintentar, setMoneda, setPeriodo } =
    useResumenFinanciero();

  return (
    <PageLayout
      acciones={
        <FinanzasEncabezadoAcciones
          moneda={moneda}
          onCambiarMoneda={setMoneda}
          onCambiarPeriodo={setPeriodo}
          periodo={periodo}
        />
      }
      anchoColumna
      subtitulo={textoActualizado(minutos)}
      titulo="Finanzas"
    >
      {cargando && <FinanzasCargando />}
      {!cargando && error && <EstadoError mensaje={error} onReintentar={reintentar} />}
      {datos && <FinanzasResumenTab datos={datos} hoy={hoy} moneda={moneda} periodo={periodo} />}
    </PageLayout>
  );
}
