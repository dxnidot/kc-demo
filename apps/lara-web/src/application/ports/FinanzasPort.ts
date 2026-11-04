import type { EventoCalendario } from "../../domain/EventoCalendario";
import type {
  MovimientoFinanciero,
  PuntoSerieMensual,
  ResumenCategoriaFinanciera,
  TotalesMensuales,
} from "../../domain/MovimientoFinanciero";
import type { Tarjeta } from "../../domain/Tarjeta";
import type {
  PreviewImportacion,
  ResultadoImportacion,
} from "../../domain/ImportacionFinanciera";

/**
 * Define las consultas financieras disponibles para las vistas de Lara.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel 2026-09-30 Agrega operaciones autenticadas de importación CSV.
 * @modified Daniel Tovar 2026-10-11 FIN-17: agrega totales mensuales y serie de 6 meses.
 */
export interface FinanzasPort {
  listarTarjetas(): Promise<Tarjeta[]>;
  listarMovimientos(): Promise<MovimientoFinanciero[]>;
  consultarResumenMensual(periodo: string): Promise<ResumenCategoriaFinanciera[]>;
  consultarTotalesMensuales(periodo: string): Promise<TotalesMensuales[]>;
  consultarSerieMensual(periodo: string): Promise<PuntoSerieMensual[]>;
  consultarCalendario(desde: string, dias: number): Promise<EventoCalendario[]>;
  actualizarTarjeta(tarjeta: Tarjeta): Promise<Tarjeta>;
  previsualizarImportacion(archivo: File): Promise<PreviewImportacion>;
  confirmarImportacion(importId: string): Promise<ResultadoImportacion>;
}
