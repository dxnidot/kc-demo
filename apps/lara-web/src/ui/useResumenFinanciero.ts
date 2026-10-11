import { useCallback, useEffect, useRef, useState } from "react";
import {
  ObtenerResumenFinanciero,
  type ResumenFinanciero,
} from "../application/use-cases/ObtenerResumenFinanciero";
import type { Moneda } from "../domain/MovimientoFinanciero";
import type { Tarjeta } from "../domain/Tarjeta";
import { adaptadores } from "../infrastructure/composition";
import { fechaLocalActual, periodoActual } from "./finanzasFormato";
import { useMinutosDesde } from "./useMinutosDesde";

const finanzasPort = adaptadores.finanzas;
const obtenerResumenFinanciero = new ObtenerResumenFinanciero(finanzasPort);

export interface ResumenFinancieroEstado {
  actualizarTarjeta: (tarjeta: Tarjeta) => void;
  cargando: boolean;
  datos: ResumenFinanciero | null;
  error: string | null;
  finanzas: typeof finanzasPort;
  hoy: string;
  minutos: number | null;
  moneda: Moneda;
  periodo: string;
  reintentar: () => void;
  setMoneda: (moneda: Moneda) => void;
  setPeriodo: (periodo: string) => void;
}

/**
 * Carga y mantiene al día el resumen financiero del periodo (movimientos, resumen, tarjetas y eventos).
 * Lo comparten las pantallas de Finanzas (Resumen, Gastos, Ingresos, Tarjetas) que antes eran pestañas
 * de una sola página y ahora son rutas propias del sidebar.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function useResumenFinanciero(): ResumenFinancieroEstado {
  const [periodo, setPeriodo] = useState(periodoActual);
  const [moneda, setMoneda] = useState<Moneda>("MXN");
  const [datos, setDatos] = useState<ResumenFinanciero | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const minutos = useMinutosDesde(actualizadoEn);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const peticion = useRef(0);

  const cargar = useCallback(async (periodoConsulta: string, silencioso: boolean) => {
    const actual = ++peticion.current;
    if (!silencioso) {
      setDatos(null);
      setCargando(true);
    }
    setError(null);
    try {
      const resultado = await obtenerResumenFinanciero.ejecutar(
        periodoConsulta,
        fechaLocalActual(),
      );
      if (actual === peticion.current) {
        setDatos(resultado);
        setActualizadoEn(new Date());
      }
    } catch (reason: unknown) {
      if (actual === peticion.current) {
        setError(
          reason instanceof Error ? reason.message : "No se pudo cargar el resumen financiero.",
        );
      }
    } finally {
      if (actual === peticion.current) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    void cargar(periodo, false);
  }, [cargar, periodo]);

  function actualizarTarjeta(actualizada: Tarjeta) {
    setDatos((actual) =>
      actual
        ? {
            ...actual,
            tarjetas: actual.tarjetas.map((tarjeta) =>
              tarjeta.id === actualizada.id ? actualizada : tarjeta,
            ),
          }
        : actual,
    );
    void cargar(periodo, true);
  }

  return {
    actualizarTarjeta,
    cargando,
    datos,
    error,
    finanzas: finanzasPort,
    hoy: fechaLocalActual(),
    minutos,
    moneda,
    periodo,
    reintentar: () => void cargar(periodo, false),
    setMoneda,
    setPeriodo,
  };
}
