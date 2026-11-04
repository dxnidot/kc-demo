package com.example.finanzas.infrastructure.adapters.in.web;

import java.math.BigDecimal;
import java.time.YearMonth;

import com.example.finanzas.domain.movimiento.Moneda;
import com.example.finanzas.domain.movimiento.PuntoSerieMensual;

/**
 * Representa un mes de la serie histórica de ingresos y gastos en la respuesta HTTP.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
public record PuntoSerieMensualResponse(YearMonth periodo, Moneda moneda, BigDecimal ingresos, BigDecimal gastos) {

    public static PuntoSerieMensualResponse desde(PuntoSerieMensual punto) {
        return new PuntoSerieMensualResponse(punto.periodo(), punto.moneda(), punto.ingresos(), punto.gastos());
    }
}
