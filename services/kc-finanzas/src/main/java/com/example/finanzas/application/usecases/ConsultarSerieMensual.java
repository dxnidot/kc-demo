package com.example.finanzas.application.usecases;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;

import com.example.finanzas.application.ports.MovimientoRepository;
import com.example.finanzas.domain.movimiento.Moneda;
import com.example.finanzas.domain.movimiento.Movimiento;
import com.example.finanzas.domain.movimiento.PuntoSerieMensual;
import com.example.finanzas.domain.movimiento.TipoMovimiento;

/**
 * Calcula ingresos y gastos mensuales de los últimos 6 meses (incluido el periodo dado), por moneda.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
@Service
public class ConsultarSerieMensual {

    private static final int MESES_SERIE = 6;

    private final MovimientoRepository movimientoRepository;

    public ConsultarSerieMensual(MovimientoRepository movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    public List<PuntoSerieMensual> ejecutar(String ownerSub, YearMonth mesFinal) {
        if (mesFinal == null) {
            throw new IllegalArgumentException("El mes final es obligatorio");
        }
        YearMonth mesInicial = mesFinal.minusMonths(MESES_SERIE - 1L);
        List<Movimiento> movimientos = movimientoRepository.listarPorPropietarioYPeriodo(
                ownerSub, mesInicial.atDay(1), mesFinal.atEndOfMonth());

        Map<ClaveMes, BigDecimal> ingresosPorMes = new TreeMap<>();
        Map<ClaveMes, BigDecimal> gastosPorMes = new TreeMap<>();
        for (Movimiento movimiento : movimientos) {
            ClaveMes clave = new ClaveMes(YearMonth.from(movimiento.fecha()), movimiento.moneda());
            Map<ClaveMes, BigDecimal> destino =
                    movimiento.tipo() == TipoMovimiento.INGRESO ? ingresosPorMes : gastosPorMes;
            destino.merge(clave, movimiento.monto(), BigDecimal::add);
        }

        List<PuntoSerieMensual> serie = new ArrayList<>();
        for (YearMonth mes = mesInicial; !mes.isAfter(mesFinal); mes = mes.plusMonths(1)) {
            for (Moneda moneda : Moneda.values()) {
                ClaveMes clave = new ClaveMes(mes, moneda);
                serie.add(new PuntoSerieMensual(
                        mes,
                        moneda,
                        ingresosPorMes.getOrDefault(clave, BigDecimal.ZERO),
                        gastosPorMes.getOrDefault(clave, BigDecimal.ZERO)));
            }
        }
        return serie;
    }

    private record ClaveMes(YearMonth mes, Moneda moneda) implements Comparable<ClaveMes> {
        @Override
        public int compareTo(ClaveMes otra) {
            int comparacionMes = mes.compareTo(otra.mes);
            return comparacionMes != 0 ? comparacionMes : moneda.name().compareTo(otra.moneda.name());
        }
    }
}
