/**
 * Movimiento financiero ya clasificado por el servicio de finanzas.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-10-11 FIN-17: el origen admite "CHAT".
 */
export interface MovimientoFinanciero {
  id: string;
  fecha: string;
  monto: number;
  moneda: Moneda;
  comercio: string;
  categoria: string;
  tarjetaId: string | null;
  origen: OrigenMovimiento;
  tipo: TipoMovimiento;
}

/**
 * Importe de una categoría calculado por finanzas para un tipo y moneda.
 * @author Daniel
 * @since 2026-09-30
 */
export interface ResumenCategoriaFinanciera {
  categoria: string;
  tipo: TipoMovimiento;
  moneda: Moneda;
  total: number;
}

/** Monedas admitidas para movimientos financieros. */
export type Moneda = "MXN" | "USD";

/** Tipos de movimiento clasificados por finanzas. */
export type TipoMovimiento = "GASTO" | "INGRESO";

/** Canales de origen admitidos por la API financiera. */
export type OrigenMovimiento = "MANUAL" | "IMPORT" | "NOTIFICACION" | "CHAT";

/**
 * Totales de ingresos, gastos y "te queda" de un mes en una moneda; el servicio ya calcula
 * `teQueda` (ingresos − gastos) y `porcentajeTeQueda` (0 si `ingresos` es 0).
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export interface TotalesMensuales {
  moneda: Moneda;
  ingresos: number;
  gastos: number;
  teQueda: number;
  porcentajeTeQueda: number;
}

/**
 * Punto de la serie de 6 meses (hasta el periodo consultado, incluido) de ingresos y gastos por moneda.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export interface PuntoSerieMensual {
  periodo: string;
  moneda: Moneda;
  ingresos: number;
  gastos: number;
}
