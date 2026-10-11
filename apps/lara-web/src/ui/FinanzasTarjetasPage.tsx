import { EstadoError } from "./components/EstadoError";
import { PageLayout } from "./components/PageLayout";
import { FinanzasCargando } from "./FinanzasCargando";
import { FinanzasEncabezadoAcciones } from "./FinanzasEncabezadoAcciones";
import { textoActualizado } from "./finanzasFormato";
import { FinanzasTarjetasTab } from "./FinanzasTarjetasTab";
import { useResumenFinanciero } from "./useResumenFinanciero";

/**
 * Pantalla "Tarjetas y pagos" de Finanzas: próximo pago, tiles de tarjetas y calendario de pagos.
 * Antes era la pestaña "Tarjetas y pagos" de una sola página; ahora es su propia ruta del sidebar.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasTarjetasPage() {
  const {
    actualizarTarjeta,
    cargando,
    datos,
    error,
    finanzas,
    hoy,
    minutos,
    moneda,
    periodo,
    reintentar,
    setMoneda,
    setPeriodo,
  } = useResumenFinanciero();

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
        <FinanzasTarjetasTab
          eventos={datos.eventos}
          finanzas={finanzas}
          hoy={hoy}
          onTarjetaActualizada={actualizarTarjeta}
          tarjetas={datos.tarjetas}
        />
      )}
    </PageLayout>
  );
}
