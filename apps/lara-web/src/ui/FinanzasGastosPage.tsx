import { EstadoError } from "./components/EstadoError";
import { PageLayout } from "./components/PageLayout";
import { FinanzasCargando } from "./FinanzasCargando";
import { FinanzasEncabezadoAcciones } from "./FinanzasEncabezadoAcciones";
import { textoActualizado } from "./finanzasFormato";
import { FinanzasMovimientosTab } from "./FinanzasMovimientosTab";
import { useResumenFinanciero } from "./useResumenFinanciero";

/**
 * Pantalla "Gastos" de Finanzas: tabla de gastos del periodo en la moneda elegida.
 * Antes era la pestaña "Gastos" de una sola página; ahora es su propia ruta del sidebar.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasGastosPage() {
  const { cargando, datos, error, minutos, moneda, periodo, reintentar, setMoneda, setPeriodo } =
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
      {datos && (
        <FinanzasMovimientosTab
          moneda={moneda}
          movimientos={datos.movimientos}
          periodo={periodo}
          tarjetas={datos.tarjetas}
          tipo="GASTO"
        />
      )}
    </PageLayout>
  );
}
