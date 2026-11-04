package com.example.finanzas.domain.movimiento;

import java.math.BigDecimal;

/**
 * Totales de ingresos, gastos y lo que queda para un periodo y una moneda, sin combinar monedas.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
public record TotalesMensuales(
        Moneda moneda, BigDecimal ingresos, BigDecimal gastos, BigDecimal teQueda, BigDecimal porcentajeTeQueda) {
}
