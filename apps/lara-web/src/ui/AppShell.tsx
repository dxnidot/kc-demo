import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpLeft,
  Calendar,
  CreditCard,
  Database,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Network,
  TextAlignStart,
  TrendingUp,
  Users,
  Waypoints,
  Wrench,
} from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import type { Usuario } from "../domain/Usuario";
import { IniciarSesion } from "../application/use-cases/IniciarSesion";
import { adaptadores, usarMocks } from "../infrastructure/composition";
import { useApariencia } from "./apariencia/useApariencia";
import { DialogoApariencia } from "./apariencia/DialogoApariencia";
import { AvisoCarga, Esqueleto, EsqueletoTabla } from "./components/Esqueleto";
import { AccesoDenegado } from "./components/AccesoDenegado";
import { AppSidebar, type EntradaNavSidebar, type GrupoNavSidebar } from "./components/AppSidebar";
import { PageLayout } from "./components/PageLayout";
import { LaraLogo } from "./components/LaraLogo";
import { IndicadorMock } from "./components/IndicadorMock";
import { SidebarProvider, SidebarTrigger, useSidebar } from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { ChatPage } from "./ChatPage";
import { FinanzasChatPage } from "./FinanzasChatPage";
import { FinanzasGastosPage } from "./FinanzasGastosPage";
import { FinanzasIngresosPage } from "./FinanzasIngresosPage";
import { FinanzasInversionesPage } from "./FinanzasInversionesPage";
import { FinanzasResumenPage } from "./FinanzasResumenPage";
import { FinanzasTarjetasPage } from "./FinanzasTarjetasPage";
import { LoginPage } from "./LoginPage";
import { ChatSessionsProvider, useChatSessions } from "./useChatSessions";
import { useHasRole } from "./useHasRole";
import { tituloDeRuta, useTituloDocumento } from "./tituloDocumento";
import { useVistaEstrecha } from "./useVistaEstrecha";

const AgentesPage = lazy(() => import("./AgentesPage").then((m) => ({ default: m.AgentesPage })));
const BaseDeDatosPage = lazy(() =>
  import("./BaseDeDatosPage").then((m) => ({ default: m.BaseDeDatosPage })),
);
const EstadoLabPage = lazy(() =>
  import("./EstadoLabPage").then((m) => ({ default: m.EstadoLabPage })),
);
const GastosFijosPage = lazy(() =>
  import("./GastosFijosPage").then((m) => ({ default: m.GastosFijosPage })),
);
const HerramientasPage = lazy(() =>
  import("./HerramientasPage").then((m) => ({ default: m.HerramientasPage })),
);
const MemoriaPage = lazy(() => import("./MemoriaPage").then((m) => ({ default: m.MemoriaPage })));
const MenuPorRolPage = lazy(() =>
  import("./MenuPorRolPage").then((m) => ({ default: m.MenuPorRolPage })),
);
const UsuariosRolesPage = lazy(() =>
  import("./UsuariosRolesPage").then((m) => ({ default: m.UsuariosRolesPage })),
);

const iniciarSesion = new IniciarSesion(adaptadores.auth);
const idContenidoPrincipal = "contenido-principal";
const iconoNav = "size-4.5 shrink-0";

/**
 * Autentica al usuario (login propio de Lara + Keycloak) y compone el shell con sus vistas.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-09-30 Pantalla de login propia, sidebar de la maqueta y una ruta por vista.
 * @modified Daniel Tovar 2026-09-30 Shell sobre PageLayout, drawer de navegación bajo 980px, landmarks y carga diferida.
 * @modified Daniel Tovar 2026-10-01 Oculta del DOM las secciones AGENTES, IDENTIDAD y PERSONAL según los roles del usuario.
 * @modified Daniel Tovar 2026-10-02 Protege las rutas de esas secciones: sin el rol muestra AccesoDenegado.
 * @modified Daniel Tovar 2026-10-10 Renombra identificadores de Keycloak según ADR-0006.
 * @modified Daniel Tovar 2026-10-10 El shell usa PageLayout libre: sin el marco de 32/24/32 px alrededor de la barra lateral.
 * @modified Daniel Tovar 2026-10-10 Botón y diálogo "Apariencia" en el pie de la barra lateral.
 * @modified Daniel Tovar 2026-10-10 Skip link, contenido principal enfocable y título del documento por vista.
 * @modified Daniel Tovar 2026-10-10 Adaptadores desde el composition root e indicador MOCK.
 * @modified Daniel Tovar 2026-10-10 Esqueletos de carga y reintento en Recientes.
 * @modified Daniel Tovar 2026-10-10 Las rutas viejas de Trading MX y Trading USA redirigen a Inversiones.
 * @modified Daniel Tovar 2026-10-10 El foco al contraer/mostrar la barra ya no se pierde si un efecto viejo corre antes (carrera del montaje).
 * @modified Daniel Tovar 2026-10-11 UI-12: FINANZAS es su propia sección del sidebar (mismo patrón que LABORATORIO),
 * ya no un item plano de PERSONAL. Gastos fijos se muda ahí, Inversiones es un desplegable con MX/USA y el chat
 * de Finanzas pasa de panel deslizante a ruta propia.
 * @modified Daniel Tovar 2026-11-03 Sidebar de shadcn/ui (grupos Conversación/Finanzas/Agente/Pruebas, siempre
 * visibles, colapsable a iconos). El drawer móvil, la trampa de foco y el riel manual los resuelve ahora el
 * propio componente Sidebar (Sheet de Radix); se borró esa lógica propia.
 */
export function AppShell() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [comprobando, setComprobando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    iniciarSesion
      .ejecutar()
      .then((autenticado) => {
        if (active) {
          setUsuario(autenticado);
        }
      })
      .catch(() => {
        if (active) {
          setError("No se pudo conectar con Keycloak. Revisa que esté arriba en localhost:8080.");
        }
      })
      .finally(() => {
        if (active) {
          setComprobando(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function continuarConKeycloak() {
    setError(null);
    iniciarSesion.login().catch(() => {
      setError("No se pudo abrir el login de Keycloak. Revisa que esté arriba en localhost:8080.");
    });
  }

  if (!usuario) {
    return <LoginPage comprobando={comprobando} error={error} onLogin={continuarConKeycloak} />;
  }

  return (
    <ChatSessionsProvider userId={usuario.id}>
      <AppShellLayout usuario={usuario} />
    </ChatSessionsProvider>
  );
}

interface AppShellLayoutProps {
  usuario: Usuario;
}

/** Barra superior de móvil (bajo 980px): marca + botón que abre el drawer de navegación. */
function BarraSuperiorMovil() {
  const { openMobile } = useSidebar();
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-sidebar px-2">
      <SidebarTrigger aria-expanded={openMobile} aria-label="Abrir navegación" />
      <div className="flex items-center gap-2.5">
        <LaraLogo />
        <span className="text-brand font-semibold">Lara</span>
        <IndicadorMock activo={usarMocks} />
      </div>
    </header>
  );
}

function CargandoVista() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <AvisoCarga texto="Cargando vista…" />
      <div aria-hidden="true" className="flex flex-col gap-3">
        <Esqueleto className="h-7 w-1/3" />
        <Esqueleto className="h-4 w-1/2" />
      </div>
      <EsqueletoTabla />
    </div>
  );
}

function AppShellLayout({ usuario }: AppShellLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const estrecha = useVistaEstrecha();
  const {
    activeSessionId,
    historyError,
    isLoadingHistory,
    refreshSessions,
    selectSession,
    sessions,
    setActiveSessionId,
  } = useChatSessions();
  // shortcut: instancia propia de useApariencia para el toggle rápido del sidebar, separada de la que
  // usa DialogoApariencia (cada una con su propio estado de React); si el diálogo está abierto a la vez
  // que se usa el toggle rápido, el diálogo no refleja el cambio hasta que se remonta. Si eso molesta,
  // sube el estado a un contexto compartido.
  const { tema, cambiarTema } = useApariencia();
  const [error, setError] = useState<string | null>(null);
  const [aparienciaAbierta, setAparienciaAbierta] = useState(false);
  useTituloDocumento(tituloDeRuta(pathname));
  const puedeVerAgentes = useHasRole(usuario, ["ver_agentes", "admin"]);
  const puedeVerIdentidad = useHasRole(usuario, ["ver_identidad", "admin"]);
  const puedeVerFinanzas = useHasRole(usuario, ["ver-finanzas", "admin"]);

  const contenidoPrincipal = useRef<HTMLElement | null>(null);
  const botonUsuario = useRef<HTMLButtonElement | null>(null);
  const aparienciaEstabaAbierta = useRef(false);

  useEffect(() => {
    // El foco vuelve al botón de usuario (su trigger) al cerrar el diálogo, que vive fuera del menú
    // ya desmontado que lo abrió.
    if (aparienciaEstabaAbierta.current && !aparienciaAbierta) {
      botonUsuario.current?.focus();
    }
    aparienciaEstabaAbierta.current = aparienciaAbierta;
  }, [aparienciaAbierta]);

  function iniciarChatNuevo() {
    setError(null);
    setActiveSessionId(null);
    navigate("/chat");
  }

  async function cerrarSesion() {
    try {
      await adaptadores.auth.logout();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "No se pudo cerrar sesión.");
    }
  }

  const protegido = (permitido: boolean, elemento: ReactNode) =>
    permitido ? elemento : <AccesoDenegado />;

  // Grupo "Pruebas" (Identidad): oculto por defecto, se activa con VITE_MOSTRAR_PRUEBAS=true en .env.local.
  const mostrarPruebas = import.meta.env.VITE_MOSTRAR_PRUEBAS === "true";

  const grupoConversacion: GrupoNavSidebar = {
    titulo: "Conversación",
    items: [
      {
        etiqueta: "Chat",
        icono: <MessageCircle aria-hidden="true" className={iconoNav} />,
        onClick: iniciarChatNuevo,
        ruta: "/chat",
      },
      {
        etiqueta: "Estado del lab",
        icono: <LayoutDashboard aria-hidden="true" className={iconoNav} />,
        ruta: "/estado",
      },
    ],
  };

  const itemsFinanzas: EntradaNavSidebar[] = puedeVerFinanzas
    ? [
        {
          etiqueta: "Resumen",
          icono: <LayoutGrid aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/resumen",
        },
        {
          etiqueta: "Chat de Finanzas",
          icono: <MessageCircle aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/chat",
        },
        {
          etiqueta: "Gastos",
          icono: <ArrowDownRight aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/gastos",
        },
        {
          etiqueta: "Gastos fijos",
          icono: <Calendar aria-hidden="true" className={iconoNav} />,
          ruta: "/gastos-fijos",
        },
        {
          etiqueta: "Ingresos",
          icono: <ArrowUpLeft aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/ingresos",
        },
        {
          etiqueta: "Tarjetas y pagos",
          icono: <CreditCard aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/tarjetas",
        },
        {
          etiqueta: "Inversiones",
          hijos: [
            { etiqueta: "MX", ruta: "/finanzas/inversiones/mx" },
            { etiqueta: "USA", ruta: "/finanzas/inversiones/usa" },
          ],
          icono: <TrendingUp aria-hidden="true" className={iconoNav} />,
          ruta: "/finanzas/inversiones",
        },
      ]
    : [];

  const itemsAgente: EntradaNavSidebar[] = puedeVerAgentes
    ? [
        {
          etiqueta: "Agentes",
          icono: <Network aria-hidden="true" className={iconoNav} />,
          ruta: "/agentes",
        },
        {
          etiqueta: "Base de datos",
          icono: <Database aria-hidden="true" className={iconoNav} />,
          ruta: "/base-de-datos",
        },
        {
          etiqueta: "Memoria vectorizada",
          icono: <Waypoints aria-hidden="true" className={iconoNav} />,
          ruta: "/memoria",
        },
        {
          etiqueta: "Herramientas MCP",
          icono: <Wrench aria-hidden="true" className={iconoNav} />,
          ruta: "/herramientas",
        },
      ]
    : [];

  const itemsPruebas: EntradaNavSidebar[] =
    puedeVerIdentidad && mostrarPruebas
      ? [
          {
            etiqueta: "Menú por rol",
            icono: <TextAlignStart aria-hidden="true" className={iconoNav} />,
            ruta: "/menu-por-rol",
          },
          {
            etiqueta: "Usuarios y roles",
            icono: <Users aria-hidden="true" className={iconoNav} />,
            ruta: "/usuarios",
          },
        ]
      : [];

  const grupos: GrupoNavSidebar[] = [
    grupoConversacion,
    ...(itemsFinanzas.length > 0 ? [{ titulo: "Finanzas", items: itemsFinanzas }] : []),
    ...(itemsAgente.length > 0 ? [{ titulo: "Agente", items: itemsAgente }] : []),
    ...(itemsPruebas.length > 0 ? [{ titulo: "Pruebas", items: itemsPruebas }] : []),
  ];

  const barraSuperior = estrecha && (
    <BarraSuperiorMovil />
  );

  return (
    <TooltipProvider delayDuration={300}>
    <SidebarProvider>
      <PageLayout
        cabecera={barraSuperior || undefined}
        className="h-dvh bg-bg font-sans text-text"
        desplazable={false}
        libre
      >
        <a
          className="sr-only z-50 rounded-button bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:inline-flex focus:min-h-11 focus:items-center"
          href={`#${idContenidoPrincipal}`}
          onClick={(event) => {
            event.preventDefault();
            contenidoPrincipal.current?.focus();
          }}
        >
          Saltar al contenido principal
        </a>
        <div className="flex min-h-0 min-w-0 flex-1">
          <AppSidebar
            grupos={grupos}
            onAbrirApariencia={() => setAparienciaAbierta(true)}
            onCambiarTema={cambiarTema}
            onCerrarSesion={() => void cerrarSesion()}
            recientes={{
              activeSessionId,
              enRutaChat: pathname === "/chat",
              historyError,
              isLoadingHistory,
              onReintentar: () => void refreshSessions().catch(() => undefined),
              onSeleccionar: (id) => {
                selectSession(id);
                navigate("/chat");
              },
              sessions,
            }}
            tema={tema}
            usuario={usuario}
            usuarioBotonRef={botonUsuario}
          />

          <main
            className="flex min-h-0 min-w-0 flex-1 flex-col outline-none"
            id={idContenidoPrincipal}
            ref={contenidoPrincipal}
            tabIndex={-1}
          >
            {error && (
              <p className="m-0 shrink-0 border-b border-border bg-surface-active px-4 py-3 text-sm text-danger sm:px-6" role="alert">
                {error}
              </p>
            )}
            <Suspense fallback={<CargandoVista />}>
              <Routes>
                <Route path="/" element={<Navigate replace to="/chat" />} />
                <Route path="/chat" element={<ChatPage usuario={usuario} />} />
                <Route path="/estado" element={<EstadoLabPage />} />
                <Route path="/agentes" element={protegido(puedeVerAgentes, <AgentesPage />)} />
                <Route
                  path="/base-de-datos"
                  element={protegido(
                    puedeVerAgentes,
                    <BaseDeDatosPage baseDatos={adaptadores.baseDatos} usuario={usuario} />,
                  )}
                />
                <Route
                  path="/memoria"
                  element={protegido(puedeVerAgentes, <MemoriaPage memoria={adaptadores.memoria} />)}
                />
                <Route path="/herramientas" element={protegido(puedeVerAgentes, <HerramientasPage />)} />
                <Route
                  path="/menu-por-rol"
                  element={protegido(
                    puedeVerIdentidad,
                    <MenuPorRolPage menuPorRol={adaptadores.menuPorRol} usuario={usuario} />,
                  )}
                />
                <Route
                  path="/usuarios"
                  element={protegido(
                    puedeVerIdentidad,
                    <UsuariosRolesPage usuariosRealm={adaptadores.usuariosRealm} />,
                  )}
                />
                <Route
                  path="/gastos-fijos"
                  element={protegido(
                    puedeVerFinanzas,
                    <GastosFijosPage gastosFijos={adaptadores.gastosFijos} />,
                  )}
                />
                <Route
                  path="/finanzas"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/resumen" />)}
                />
                <Route
                  path="/finanzas/resumen"
                  element={protegido(puedeVerFinanzas, <FinanzasResumenPage />)}
                />
                <Route
                  path="/finanzas/chat"
                  element={protegido(puedeVerFinanzas, <FinanzasChatPage />)}
                />
                <Route
                  path="/finanzas/gastos"
                  element={protegido(puedeVerFinanzas, <FinanzasGastosPage />)}
                />
                <Route
                  path="/finanzas/ingresos"
                  element={protegido(puedeVerFinanzas, <FinanzasIngresosPage />)}
                />
                <Route
                  path="/finanzas/tarjetas"
                  element={protegido(puedeVerFinanzas, <FinanzasTarjetasPage />)}
                />
                <Route
                  path="/finanzas/inversiones"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/inversiones/mx" />)}
                />
                <Route
                  path="/finanzas/inversiones/mx"
                  element={protegido(puedeVerFinanzas, <FinanzasInversionesPage cuenta="mx" />)}
                />
                <Route
                  path="/finanzas/inversiones/usa"
                  element={protegido(puedeVerFinanzas, <FinanzasInversionesPage cuenta="usa" />)}
                />
                {/* Rutas viejas: Finanzas con pestañas, inversiones por ?mercado= y Pagos como pestaña. */}
                <Route
                  path="/finanzas/pagos"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/tarjetas" />)}
                />
                <Route
                  path="/finanzas/trading-mx"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/inversiones/mx" />)}
                />
                <Route
                  path="/finanzas/trading-usa"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/inversiones/usa" />)}
                />
                <Route
                  path="/finanzas/*"
                  element={protegido(puedeVerFinanzas, <Navigate replace to="/finanzas/resumen" />)}
                />
                <Route path="*" element={<Navigate replace to="/chat" />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        {aparienciaAbierta && <DialogoApariencia onCerrar={() => setAparienciaAbierta(false)} />}
      </PageLayout>
    </SidebarProvider>
    </TooltipProvider>
  );
}
