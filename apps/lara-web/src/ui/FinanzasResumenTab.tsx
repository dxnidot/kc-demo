import { Link } from "react-router";
import type { ResumenFinanciero } from "../application/use-cases/ObtenerResumenFinanciero";
import type { Moneda } from "../domain/MovimientoFinanciero";
import { Card } from "./components/Card";
import { claseBotonSobreResaltado, ProximoPago } from "./components/ProximoPago";
import { claseFoco } from "./components/foco";
import { Tag } from "./components/Tag";
import { etiquetaOrigen, fechaCorta, formatoMoneda, mesCorto, textoEnDias } from "./finanzasFormato";

interface FinanzasResumenTabProps {
  datos: ResumenFinanciero;
  moneda: Moneda;
  periodo: string;
}

interface KpiProps {
  titulo: string;
  valor: string;
  detalle?: string;
}

const coloresBarra = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
const maximoMovimientos = 5;
const enlaceClase = `inline-flex min-h-11 items-center text-compact text-accent underline hover:text-accent-hover shell:min-h-0 ${claseFoco}`;

/** Una de las 3 tarjetas de totales del mes (mockup 12): título, cifra grande y un detalle opcional. */
function Kpi({ titulo, valor, detalle }: KpiProps) {
  return (
    <Card>
      <span className="text-compact text-faint">{titulo}</span>
      <span className="num text-title font-semibold tracking-tight">{valor}</span>
      {detalle && <span className="num text-xs text-faint">{detalle}</span>}
    </Card>
  );
}

/**
 * Resumen de finanzas: próximo pago, totales del mes, ingresos vs gastos de 6 meses, gastos por
 * categoría, próximos pagos y últimos movimientos. Todo en la moneda elegida en el encabezado: nunca
 * se suman MXN y USD, así que si ambas tuvieron movimientos el periodo se repasa cambiando de moneda.
 * @author Daniel Tovar
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-10-10 Textos sin jerga de backlog.
 * @modified Daniel Tovar 2026-10-10 Últimos movimientos en 3 columnas (el origen va bajo el concepto): el monto ya no queda cortado.
 * @modified Daniel Tovar 2026-10-10 Bloque de próximo pago destacado y un solo aviso en lugar de 3 KPIs vacíos (mockup 12).
 * @modified Daniel Tovar 2026-10-11 FIN-17: conecta los 3 KPIs y la gráfica de 6 meses con el backend real
 * (totalesMensuales y serieMensual); el próximo pago usa evento.ultimos4 y evento.diasRestantes.
 * @modified Daniel Tovar 2026-11-03 "Próximos pagos" muestra "en N días" (evento.diasRestantes) en vez del
 * Tag de tipo, como en el mockup 12.
 */
export function FinanzasResumenTab({ datos, moneda, periodo }: FinanzasResumenTabProps) {
  const proximoPago = datos.eventos.find((evento) => evento.tipo === "PAGO");
  const totales = datos.totalesMensuales.find((fila) => fila.moneda === moneda);
  const serie = datos.serieMensual.filter((punto) => punto.moneda === moneda);
  const maximoSerie = Math.max(1, ...serie.flatMap((punto) => [punto.ingresos, punto.gastos]));
  const categorias = datos.resumen
    .filter((fila) => fila.tipo === "GASTO" && fila.moneda === moneda)
    .sort((a, b) => b.total - a.total);
  const mayor = categorias[0]?.total ?? 0;
  const ultimos = datos.movimientos
    .filter((movimiento) => movimiento.fecha.startsWith(periodo) && movimiento.moneda === moneda)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, maximoMovimientos);

  return (
    <div className="flex flex-col gap-4">
      <ProximoPago
        accion={
          <Link className={claseBotonSobreResaltado} to="/finanzas/tarjetas">
            Ver calendario
          </Link>
        }
        evento={proximoPago}
      />

      <div className="grid grid-cols-1 gap-4 wide:grid-cols-3">
        <Kpi titulo="Ingresos del mes" valor={formatoMoneda[moneda].format(totales?.ingresos ?? 0)} />
        <Kpi titulo="Gastos del mes" valor={formatoMoneda[moneda].format(totales?.gastos ?? 0)} />
        <Kpi
          detalle={`${(totales?.porcentajeTeQueda ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 1 })}% del ingreso`}
          titulo="Te queda"
          valor={formatoMoneda[moneda].format(totales?.teQueda ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 wide:grid-cols-2">
        <Card aria-labelledby="serie-titulo">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-base font-semibold" id="serie-titulo">
              Ingresos vs gastos · 6 meses
            </h2>
            <ul className="m-0 flex list-none gap-3.5 p-0 text-xs text-muted">
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 rounded-sm bg-chart-1" />
                Ingresos
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 rounded-sm bg-chart-2" />
                Gastos
              </li>
            </ul>
          </div>
          {serie.every((punto) => punto.ingresos === 0 && punto.gastos === 0) ? (
            <p className="m-0 text-sm text-muted">
              No hay movimientos en {moneda} en los últimos 6 meses.
            </p>
          ) : (
            <>
              <div
                aria-label={`Ingresos y gastos mensuales en ${moneda} de los últimos 6 meses`}
                className="flex h-42 items-end gap-4.5 border-b border-divider pt-3"
                role="img"
              >
                {serie.map((punto) => (
                  <div className="flex h-full flex-grow items-end justify-center gap-1" key={punto.periodo}>
                    <div
                      aria-hidden="true"
                      className="w-3.5 rounded-t bg-chart-1"
                      style={{ height: `${(punto.ingresos / maximoSerie) * 100}%` }}
                    />
                    <div
                      aria-hidden="true"
                      className="w-3.5 rounded-t bg-chart-2"
                      style={{ height: `${(punto.gastos / maximoSerie) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4.5 text-xs text-faint">
                {serie.map((punto) => (
                  <span className="flex-grow text-center" key={punto.periodo}>
                    {mesCorto(punto.periodo)}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card aria-labelledby="categorias-titulo">
          <h2 className="m-0 text-base font-semibold" id="categorias-titulo">
            Gastos por categoría
          </h2>
          {categorias.length === 0 ? (
            <p className="m-0 text-sm text-muted">
              No hay gastos por categoría en {moneda} para este periodo.
            </p>
          ) : (
            <ul
              aria-label={`Importes de gastos por categoría en ${moneda}`}
              className="m-0 flex list-none flex-col gap-3 p-0"
            >
              {categorias.map((fila, indice) => (
                <li
                  className="grid grid-cols-[110px_minmax(0,1fr)_72px] items-center gap-3 text-compact"
                  key={fila.categoria}
                >
                  <span className="truncate">{fila.categoria}</span>
                  <div aria-hidden="true" className="h-2.5 rounded-md bg-surface-active">
                    <div
                      className={`h-full rounded-md ${coloresBarra[indice % coloresBarra.length]}`}
                      style={{ width: `${mayor > 0 ? (fila.total / mayor) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-right font-mono">
                    {formatoMoneda[moneda].format(fila.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 wide:grid-cols-2">
        <Card aria-labelledby="proximos-pagos-titulo">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-base font-semibold" id="proximos-pagos-titulo">
              Próximos pagos
            </h2>
            <Link className={enlaceClase} to="/finanzas/tarjetas">
              Ver calendario
            </Link>
          </div>
          {datos.eventos.length === 0 ? (
            <p className="m-0 text-sm text-muted">
              No hay cortes ni pagos en los próximos 30 días.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {datos.eventos.map((evento, indice) => (
                <li
                  className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-divider py-2.5 text-sm last:border-0"
                  key={`${evento.fecha}-${evento.tipo}-${evento.alias}-${indice}`}
                >
                  <span className="font-mono text-muted">{fechaCorta(evento.fecha)}</span>
                  <span className="truncate">
                    {evento.tipo === "PAGO" ? "Pago" : "Corte"} · {evento.alias}
                  </span>
                  <span className="num text-right text-faint">
                    {textoEnDias(evento.diasRestantes)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card aria-labelledby="ultimos-titulo">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-base font-semibold" id="ultimos-titulo">
              Últimos movimientos
            </h2>
            <Link className={enlaceClase} to="/finanzas/gastos">
              Ver todos
            </Link>
          </div>
          {ultimos.length === 0 ? (
            <p className="m-0 text-sm text-muted">
              No hay movimientos en {moneda} para este periodo.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-compact">
              <caption className="sr-only">Últimos movimientos en {moneda}</caption>
              <thead className="bg-surface">
                <tr className="border-b border-divider text-muted">
                  <th className="px-2 py-2.5 font-medium" scope="col">fecha</th>
                  <th className="px-2 py-2.5 font-medium" scope="col">concepto</th>
                  <th className="px-2 py-2.5 text-right font-medium" scope="col">monto</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((movimiento) => (
                  <tr
                    className="border-b border-divider text-text-2 last:border-0"
                    key={movimiento.id}
                  >
                    <td className="whitespace-nowrap px-2 py-3 align-top font-mono">
                      {fechaCorta(movimiento.fecha)}
                    </td>
                    <td className="px-2 py-3">
                      <span className="block">{movimiento.comercio}</span>
                      <span className="mt-1 inline-flex">
                        <span className="sr-only">Origen: </span>
                        <Tag>{etiquetaOrigen(movimiento.origen)}</Tag>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right align-top font-mono">
                      {movimiento.tipo === "GASTO" ? "−" : "+"}
                      {formatoMoneda[movimiento.moneda].format(movimiento.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
