package com.example.finanzas.application.usecases;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.example.finanzas.application.ports.MovimientoRepository;
import com.example.finanzas.domain.movimiento.Moneda;
import com.example.finanzas.domain.movimiento.Movimiento;
import com.example.finanzas.domain.movimiento.TipoMovimiento;
import com.example.finanzas.domain.movimiento.TotalesMensuales;

/**
 * Calcula ingresos, gastos y lo que queda de un periodo, por moneda, sin combinar monedas.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
@Service
public class ConsultarTotalesMensuales {

    private static final int ESCALA_PORCENTAJE = 2;

    private final MovimientoRepository movimientoRepository;

    public ConsultarTotalesMensuales(MovimientoRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    public List<TotalesMensuales> ejecutar(String ownerSub, YearMonth periodo) {
        if (periodo == null) {
            throw new IllegalArgumentException("El periodo es obligatorio");
        }
        List<Movimiento> movimientos = movimientoRepository.listarPorPropietarioYPeriodo(
                ownerSub, periodo.atDay(1), periodo.atEndOfMonth());

        Map<Moneda, BigDecimal> ingresosPorMoneda = new EnumMap<>(Moneda.class);
        Map<Moneda, BigDecimal> gastosPorMoneda = new EnumMap<>(Moneda.class);
        for (Movimiento movimiento : movimientos) {
            Map<Moneda, BigDecimal> destino =
                    movimiento.tipo() == TipoMovimiento.INGRESO ? ingresosPorMoneda : gastosPorMoneda;
            destino.merge(movimiento.moneda(), movimiento.monto(), BigDecimal::add);
        }

        return monedasConMovimiento(ingresosPorMoneda, gastosPorMoneda).stream()
                .map(moneda -> totales(
                        moneda,
                        ingresosPorMoneda.getOrDefault(moneda, BigDecimal.ZERO),
                        gastosPorMoneda.getOrDefault(moneda, BigDecimal.ZERO)))
                .toList();
    }

    private List<Moneda> monedasConMovimiento(
            Map<Moneda, BigDecimal> ingresosPorMoneda, Map<Moneda, BigDecimal> gastosPorMoneda) {
        return Stream.concat(ingresosPorMoneda.keySet().stream(), gastosPorMoneda.keySet().stream())
                .distinct()
                .sorted(Comparator.comparing(Moneda::name))
                .toList();
    }

    private TotalesMensuales totales(Moneda moneda, BigDecimal ingresos, BigDecimal gastos) {
        BigDecimal teQueda = ingresos.subtract(gastos);
        BigDecimal porcentaje = ingresos.signum() == 0
                ? BigDecimal.ZERO.setScale(ESCALA_PORCENTAJE)
                : teQueda.multiply(BigDecimal.valueOf(100))
                        .divide(ingresos, ESCALA_PORCENTAJE, RoundingMode.HALF_UP);
        return new TotalesMensuales(moneda, ingresos, gastos, teQueda, porcentaje);
    }
}
