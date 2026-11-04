// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { EventoCalendario } from "../../domain/EventoCalendario";
import { ProximoPago } from "./ProximoPago";

const evento: EventoCalendario = {
  fecha: "2026-10-05",
  tipo: "PAGO",
  alias: "Tarjeta A",
  ultimos4: "1234",
  diasRestantes: 5,
};

afterEach(cleanup);

describe("ProximoPago", () => {
  it("muestra alias, ••••, fecha con día de la semana y en cuántos días (del servicio)", () => {
    render(
      <ProximoPago accion={<button type="button">Ver calendario</button>} evento={evento} />,
    );

    const bloque = screen.getByRole("region", { name: "Próximo pago" });
    expect(within(bloque).getByText("Tarjeta A")).toBeTruthy();
    expect(within(bloque).getByText("••••1234")).toBeTruthy();
    expect(within(bloque).getByText("lunes 5 oct · en 5 días")).toBeTruthy();
    expect(within(bloque).getByRole("button", { name: "Ver calendario" })).toBeTruthy();
  });

  it("dice hoy y mañana según diasRestantes", () => {
    const { rerender } = render(<ProximoPago evento={{ ...evento, diasRestantes: 0 }} />);
    expect(screen.getByText(/· hoy$/)).toBeTruthy();

    rerender(<ProximoPago evento={{ ...evento, diasRestantes: 1 }} />);
    expect(screen.getByText(/· mañana$/)).toBeTruthy();
  });

  it("sin evento dice que no hay pagos próximos y no muestra ••••", () => {
    render(<ProximoPago />);

    expect(screen.getByText("Sin pagos próximos")).toBeTruthy();
    expect(screen.getByText("No hay pagos en los próximos 30 días.")).toBeTruthy();
    expect(screen.queryByText(/••••/)).toBeNull();
  });

  it("usa solo tokens: bloque highlight con su tinta", () => {
    render(<ProximoPago />);

    const bloque = screen.getByRole("region", { name: "Próximo pago" });
    expect(bloque.className).toContain("bg-highlight");
    expect(bloque.className).toContain("text-highlight-ink");
  });
});
