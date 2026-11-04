package com.example.finanzas.infrastructure.adapters.in.web;

import java.math.BigDecimal;

import com.example.finanzas.domain.movimiento.Moneda;
import com.example.finanzas.domain.movimiento.TotalesMensuales;

/**
 * Representa los totales mensuales de una moneda en la respuesta HTTP.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
public record TotalesMensualesResponse(
        Moneda moneda, BigDecimal ingresos, BigDecimal gastos, BigDecimal teQueda, BigDecimal porcentajeTeQueda) {

    public static TotalesMensualesResponse desde(TotalesMensuales totales) {
        return new TotalesMensualesResponse(
                totales.moneda(), totales.ingresos(), totales.gastos(), totales.teQueda(),
                totales.porcentajeTeQueda());
    }
}
