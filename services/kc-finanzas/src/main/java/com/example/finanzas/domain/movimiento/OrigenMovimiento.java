package com.example.finanzas.domain.movimiento;

/**
 * Indica el canal de origen de un movimiento.
 * @author Daniel Tovar
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-10-11 Agrega CHAT para movimientos registrados por el agente (FIN-17)
 */
public enum OrigenMovimiento {
    MANUAL,
    IMPORT,
    NOTIFICACION,
    CHAT
}
