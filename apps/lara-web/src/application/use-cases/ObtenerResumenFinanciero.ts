import type { EventoCalendario } from "../../domain/EventoCalendario";
import type {
  MovimientoFinanciero,
  PuntoSerieMensual,
  ResumenCategoriaFinanciera,
  TotalesMensuales,
} from "../../domain/MovimientoFinanciero";
import type { Tarjeta } from "../../domain/Tarjeta";
import type { FinanzasPort } from "../ports/FinanzasPort";

/** Días del calendario de cortes y pagos que consulta el panel. */
export const DIAS_CALENDARIO = 30;

/**
 * Respuesta de lectura del panel, compuesta con resultados del servicio.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-09-30 Incluye el calendario de cortes y pagos.
 * @modified Daniel Tovar 2026-10-11 FIN-17: agrega totalesMensuales y serieMensual.
 */
export interface ResumenFinanciero {
  movimientos: MovimientoFinanciero[];
  resumen: ResumenCategoriaFinanciera[];
  tarjetas: Tarjeta[];
  eventos: EventoCalendario[];
  totalesMensuales: TotalesMensuales[];
  serieMensual: PuntoSerieMensual[];
}

/**
 * Obtiene en paralelo movimientos, resumen calculado, tarjetas, calendario, totales mensuales y la
 * serie de 6 meses. Todas las pantallas de Finanzas comparten esta carga.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-09-30 Agrega el calendario de los próximos 30 días.
 * @modified Daniel Tovar 2026-10-11 FIN-17: agrega totales mensuales y serie de 6 meses.
 */
export class ObtenerResumenFinanciero {
  constructor(private readonly finanzas: FinanzasPort) {}

  async ejecutar(periodo: string, desde: string): Promise<ResumenFinanciero> {
    const [movimientos, resumen, tarjetas, eventos, totalesMensuales, serieMensual] = await Promise.all([
      this.finanzas.listarMovimientos(),
      this.finanzas.consultarResumenMensual(periodo),
      this.finanzas.listarTarjetas(),
      this.finanzas.consultarCalendario(desde, DIAS_CALENDARIO),
      this.finanzas.consultarTotalesMensuales(periodo),
      this.finanzas.consultarSerieMensual(periodo),
    ]);
    return { movimientos, resumen, tarjetas, eventos, totalesMensuales, serieMensual };
  }
}
