package com.example.finanzas.domain.tarjeta;

import java.time.LocalDate;

/**
 * Describe una fecha de corte o pago de una tarjeta.
 * @author Daniel Tovar
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-10-11 Agrega ultimos4 y diasRestantes para identificar la tarjeta sin otra consulta (FIN-17)
 */
public record EventoCalendario(LocalDate fecha, TipoEvento tipo, String alias, String ultimos4, long diasRestantes) {
}
