# UI-12 · Finanzas como sección propia del sidebar

- Estado: Hecho
- Prioridad: Media
- Parte del lab: reestructura de IA sobre Finanzas (post UI-09)
- Depende de: UI-09
- Fecha: 2026-10-11
- Contexto: Finanzas era un item plano dentro de `PERSONAL · SOLO LOCAL`, con 5 pestañas (`Resumen`, `Gastos`, `Ingresos`, `Tarjetas y pagos`, `Inversiones` con selector `?mercado=`) dentro de una sola página (`/finanzas/:tab`), más un chat especializado como panel deslizante. Pasa a ser una sección propia del sidebar, con el mismo patrón que ya usa "Laboratorio" (reemplaza todo el panel lateral, con su propio encabezado y botón "Volver al chat").
- Estructura acordada:
  ```
  FINANZAS
  ├─ Resumen
  ├─ Chat de Finanzas      ← nuevo item de primer nivel (antes panel deslizante)
  ├─ Gastos                ← antes pestaña "Gastos"
  ├─ Gastos fijos          ← se muda aquí desde PERSONAL
  ├─ Ingresos
  ├─ Tarjetas y pagos
  └─ Inversiones ▾         ← desplegable nuevo en el sidebar (primer caso)
     ├─ MX
     └─ USA
  ```
- Criterio de aceptación:
  - El sidebar muestra una sección "FINANZAS" separada (como Laboratorio), no un item plano dentro de Personal.
  - Existe un componente de `SidebarItem` con hijos desplegables, con `aria-expanded`, soporte de teclado y área mínima de 44 px; Inversiones lo usa con MX y USA como hijos.
  - Cada entrada tiene su propia ruta (ya no `?mercado=` para Inversiones); las rutas viejas (`/finanzas/trading-mx`, `/finanzas/trading-usa`, `/finanzas/pagos`) siguen redirigiendo.
  - El chat de Finanzas es una ruta/entrada de sidebar propia, no solo un panel que se abre desde dentro de la página.
  - `npm run build` y `npm test` pasan desde `apps/lara-web/`.
- Archivos relevantes:
  - apps/lara-web/src/ui/AppShell.tsx (itemsPersonal, itemsLaboratorio, SeccionNav, rutas)
  - apps/lara-web/src/ui/components/SidebarItem.tsx
  - apps/lara-web/src/ui/FinanzasPage.tsx, FinanzasInversionesTab.tsx, FinanzasChatPanel.tsx
  - apps/lara-web/src/ui/finanzasPestanas.ts
  - docs/design/lara/png/12-finanzas.png
- Notas:
  - Confirmado (decidido con el autor): Ingresos y Tarjetas y pagos también pasan a ser items propios del sidebar (no se quedan agrupados en una pantalla "Resumen" con pestañas).
  - Confirmado: Inversiones se construye como desplegable real en el sidebar (acordeón), no como pantalla intermedia con tarjetas.
  - Confirmado: esta estructura diverge de `docs/design/lara/png/12-finanzas.png` (mockup de la versión con pestañas); no se actualiza el PNG en esta historia, el contenido visual de cada pantalla (tokens, tarjetas, tipografía) se mantiene igual, solo cambia dónde vive en la navegación.
  - Confirmado: el chat de Finanzas reutiliza `FinanzasChatPanel` tal cual, con un nuevo modo `pantallaCompleta` (ancho completo, sin borde izquierdo ni botón de cerrar) en vez de panel deslizante; se promueve a su propia ruta `/finanzas/chat` vía `FinanzasChatPage`.
  - Confirmado: `FinanzasPage.tsx` y `finanzasPestanas.ts` se eliminaron; la carga de datos del resumen mensual (movimientos, resumen, tarjetas, eventos) se extrajo al hook compartido `useResumenFinanciero` y las acciones de encabezado (periodo + moneda) a `FinanzasEncabezadoAcciones`, reutilizados por Resumen, Gastos, Ingresos y Tarjetas y pagos.
  - Confirmado: el componente desplegable del sidebar es `SidebarGroup` (en `apps/lara-web/src/ui/components/SidebarItem.tsx`, junto a `SidebarItem`), con `aria-expanded`, `aria-controls`, 44px por ítem y estado derivado en el render (sin useEffect) para que abra de inmediato cuando una redirección vieja activa a uno de sus hijos.
  - Confirmado: `npm run build` y `npm test` pasan desde `apps/lara-web/` (406 pruebas). Cerrado: 2026-10-11.
