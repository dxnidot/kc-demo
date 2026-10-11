import { PageLayout } from "./components/PageLayout";
import { FinanzasInversionesTab, type CuentaId } from "./FinanzasInversionesTab";

interface FinanzasInversionesPageProps {
  cuenta: CuentaId;
}

/**
 * Pantalla "Inversiones" de Finanzas para una cuenta (MX o USA). El sidebar la ofrece como desplegable
 * con MX y USA como hijos, cada uno con su propia ruta (antes una sola pestaña con ?mercado=).
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function FinanzasInversionesPage({ cuenta }: FinanzasInversionesPageProps) {
  return (
    <PageLayout anchoColumna titulo="Finanzas">
      <FinanzasInversionesTab cuenta={cuenta} />
    </PageLayout>
  );
}
