// @vitest-environment jsdom
import { MemoryRouter } from "react-router";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ResumenFinanciero } from "../application/use-cases/ObtenerResumenFinanciero";
import { FinanzasResumenTab } from "./FinanzasResumenTab";

const periodo = "2026-10";

const base: ResumenFinanciero = {
  movimientos: [
    {
      id: "m1",
      fecha: "2026-10-05",
      monto: 250,
      moneda: "MXN",
      comercio: "Supermercado",
      categoria: "Comida",
      tarjetaId: null,
      origen: "CHAT",
      tipo: "GASTO",
    },
  ],
  resumen: [{ categoria: "Comida", tipo: "GASTO", moneda: "MXN", total: 250 }],
  tarjetas: [],
  eventos: [
    { fecha: "2026-10-12", tipo: "PAGO", alias: "Tarjeta A", ultimos4: "1234", diasRestantes: 7 },
  ],
  totalesMensuales: [
    { moneda: "MXN", ingresos: 32000, gastos: 18420.5, teQueda: 13579.5, porcentajeTeQueda: 42.4 },
  ],
  serieMensual: [
    { periodo: "2026-05", moneda: "MXN", ingresos: 0, gastos: 0 },
    { periodo: "2026-06", moneda: "MXN", ingresos: 0, gastos: 0 },
    { periodo: "2026-07", moneda: "MXN", ingresos: 0, gastos: 0 },
    { periodo: "2026-08", moneda: "MXN", ingresos: 0, gastos: 0 },
    { periodo: "2026-09", moneda: "MXN", ingresos: 30000, gastos: 17000 },
    { periodo: "2026-10", moneda: "MXN", ingresos: 32000, gastos: 18420.5 },
  ],
};

function montar(datos: ResumenFinanciero = base, moneda: "MXN" | "USD" = "MXN") {
  return render(
    <MemoryRouter>
      <FinanzasResumenTab datos={datos} moneda={moneda} periodo={periodo} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("FinanzasResumenTab · KPIs del mes", () => {
  it("muestra ingresos, gastos y te queda con su porcentaje, tomados de totalesMensuales", () => {
    montar();

    expect(screen.getByText("Ingresos del mes")).toBeTruthy();
    expect(screen.getByText("$32,000.00")).toBeTruthy();
    expect(screen.getByText("Gastos del mes")).toBeTruthy();
    expect(screen.getByText("$18,420.50")).toBeTruthy();
    expect(screen.getByText("Te queda")).toBeTruthy();
    expect(screen.getByText("$13,579.50")).toBeTruthy();
    expect(screen.getByText("42.4% del ingreso")).toBeTruthy();
  });

  it("sin totales para la moneda elegida muestra ceros en vez de romperse", () => {
    montar(base, "USD");

    expect(screen.getAllByText("USD 0.00").length).toBeGreaterThan(0);
    expect(screen.getByText("0% del ingreso")).toBeTruthy();
  });
});

describe("FinanzasResumenTab · próximo pago", () => {
  it("usa evento.ultimos4 y evento.diasRestantes del servicio", () => {
    montar();

    const bloque = screen.getByRole("region", { name: "Próximo pago" });
    expect(within(bloque).getByText("••••1234")).toBeTruthy();
    expect(within(bloque).getByText(/en 7 días$/)).toBeTruthy();
  });
});

describe("FinanzasResumenTab · próximos pagos", () => {
  it("muestra 'en N días' por evento en vez de un tag de tipo", () => {
    montar();

    const card = screen.getByRole("region", { name: "Próximos pagos" });
    expect(within(card).getByText("en 7 días")).toBeTruthy();
  });
});

describe("FinanzasResumenTab · ingresos vs gastos de 6 meses", () => {
  it("dibuja la gráfica con un punto por mes de la serie en la moneda elegida", () => {
    montar();

    expect(
      screen.getByRole("img", { name: "Ingresos y gastos mensuales en MXN de los últimos 6 meses" }),
    ).toBeTruthy();
    expect(screen.getByText("sep")).toBeTruthy();
    expect(screen.getByText("oct")).toBeTruthy();
  });

  it("sin movimientos en los últimos 6 meses lo dice en vez de una gráfica vacía", () => {
    montar({
      ...base,
      serieMensual: base.serieMensual.map((punto) => ({ ...punto, ingresos: 0, gastos: 0 })),
    });

    expect(screen.getByText("No hay movimientos en MXN en los últimos 6 meses.")).toBeTruthy();
    expect(screen.queryByRole("img", { name: /Ingresos y gastos mensuales/ })).toBeNull();
  });
});
