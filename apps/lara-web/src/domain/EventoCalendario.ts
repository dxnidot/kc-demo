/**
 * Evento de corte o pago ya calculado por el servicio de finanzas.
 * `diasRestantes` es la diferencia en días desde el `desde` de la consulta (la calcula el servicio).
 * @modified Daniel Tovar 2026-10-11 FIN-17: agrega ultimos4 y diasRestantes, ya calculados por el backend.
 */
export interface EventoCalendario {
  fecha: string;
  tipo: "CORTE" | "PAGO";
  alias: string;
  ultimos4: string;
  diasRestantes: number;
}
