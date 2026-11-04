package com.example.finanzas.domain.movimiento;

import java.math.BigDecimal;
import java.time.YearMonth;

/**
 * Totales de ingresos y gastos de un mes de la serie histórica, por moneda.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
public record PuntoSerieMensual(YearMonth periodo, Moneda moneda, BigDecimal ingresos, BigDecimal gastos) {
}
