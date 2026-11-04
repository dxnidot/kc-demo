import type { ReactNode, Ref } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { SesionChat } from "../../domain/SesionChat";
import type { Usuario } from "../../domain/Usuario";
import type { PreferenciaTema } from "../../domain/Apariencia";
import { usarMocks } from "../../infrastructure/composition";
import { AvisoCarga, Esqueleto } from "./Esqueleto";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useTemaResuelto } from "../apariencia/useTemaResuelto";
import { IndicadorMock } from "./IndicadorMock";
import { LaraLogo } from "./LaraLogo";

export interface EntradaNavSidebar {
  etiqueta: string;
  icono: ReactNode;
  ruta: string;
  hijos?: { etiqueta: string; ruta: string }[];
  onClick?: () => void;
}

export interface GrupoNavSidebar {
  titulo: string;
  items: EntradaNavSidebar[];
}

interface RecientesProps {
  activeSessionId: string | null;
  enRutaChat: boolean;
  historyError: string | null;
  isLoadingHistory: boolean;
  onReintentar: () => void;
  onSeleccionar: (id: string) => void;
  sessions: SesionChat[];
}

interface AppSidebarProps {
  grupos: GrupoNavSidebar[];
  recientes: RecientesProps;
  tema: PreferenciaTema;
  usuario: Usuario;
  usuarioBotonRef?: Ref<HTMLButtonElement>;
  onAbrirApariencia: () => void;
  onCambiarTema: (tema: PreferenciaTema) => void;
  onCerrarSesion: () => void;
}

/**
 * Sidebar de shadcn/ui (collapsible="icon") con los grupos de navegación de Lara: Conversación,
 * Finanzas, Agente y, tras la bandera VITE_MOSTRAR_PRUEBAS, Pruebas. Reemplaza el sidebar propio y el
 * riel de iconos manual de AppShell (el colapso a iconos ya lo resuelve el componente).
 * @author Daniel Tovar
 * @since 2026-11-03
 */
export function AppSidebar({
  grupos,
  recientes,
  tema,
  usuario,
  usuarioBotonRef,
  onAbrirApariencia,
  onCambiarTema,
  onCerrarSesion,
}: AppSidebarProps) {
  const { pathname } = useLocation();
  const temaResuelto = useTemaResuelto(tema);
  const { isMobile, setOpenMobile, state } = useSidebar();

  function alNavegar(onClick?: () => void) {
    return () => {
      onClick?.();
      if (isMobile) {
        setOpenMobile(false);
      }
    };
  }

  return (
    <Sidebar aria-label="Barra lateral" collapsible="icon" role="complementary">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <LaraLogo />
          <span className="truncate text-brand font-semibold">Lara</span>
          <IndicadorMock activo={usarMocks} />
        </div>
        <SidebarTrigger
          aria-expanded={isMobile ? true : state === "expanded"}
          aria-label={
            isMobile
              ? "Cerrar navegación"
              : state === "expanded"
                ? "Contraer barra lateral"
                : "Mostrar barra lateral"
          }
        />
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Principal">
          {grupos.map((grupo) => (
            <SidebarGroup key={grupo.titulo}>
              <SidebarGroupLabel asChild>
                <h2>{grupo.titulo}</h2>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {grupo.items.map((item) =>
                    item.hijos ? (
                      <SidebarMenuItem key={item.ruta}>
                        <SidebarMenuButton
                          isActive={item.hijos.some((hijo) => pathname === hijo.ruta)}
                          tooltip={item.etiqueta}
                        >
                          {item.icono}
                          <span>{item.etiqueta}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.hijos.map((hijo) => (
                            <SidebarMenuSubItem key={hijo.ruta}>
                              <SidebarMenuSubButton asChild isActive={pathname === hijo.ruta}>
                                <Link
                                  aria-current={pathname === hijo.ruta ? "page" : undefined}
                                  onClick={alNavegar()}
                                  to={hijo.ruta}
                                >
                                  {hijo.etiqueta}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem key={item.ruta}>
                        <SidebarMenuButton asChild isActive={pathname === item.ruta} tooltip={item.etiqueta}>
                          <Link
                            aria-current={pathname === item.ruta ? "page" : undefined}
                            onClick={alNavegar(item.onClick)}
                            to={item.ruta}
                          >
                            {item.icono}
                            <span>{item.etiqueta}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
        {state === "expanded" && (
          <div className="flex shrink-0 flex-col gap-0.5 p-2">
            <div className="flex items-center justify-between px-2 pb-1.5">
              <h2 className="m-0 font-mono text-label font-normal tracking-label text-sidebar-foreground/70">
                RECIENTES
              </h2>
              {recientes.isLoadingHistory && <AvisoCarga texto="Cargando conversaciones…" />}
            </div>
            <nav aria-label="Historial de chats" className="flex flex-col gap-0.5">
              {recientes.sessions.map((session) => (
                <button
                  aria-current={
                    recientes.enRutaChat && session.id === recientes.activeSessionId ? "page" : undefined
                  }
                  className={`truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent ${
                    recientes.enRutaChat && session.id === recientes.activeSessionId
                      ? "bg-sidebar-accent font-medium"
                      : ""
                  }`}
                  key={session.id}
                  onClick={alNavegar(() => recientes.onSeleccionar(session.id))}
                  type="button"
                >
                  {session.titulo}
                </button>
              ))}
              {!recientes.isLoadingHistory && recientes.sessions.length === 0 && (
                <p className="m-0 px-2 py-2 text-xs text-sidebar-foreground/70">
                  Aún no hay conversaciones.
                </p>
              )}
              {recientes.historyError && (
                <div className="flex flex-col items-start gap-1 px-2 py-2">
                  <p className="m-0 text-xs text-danger" role="alert">{recientes.historyError}</p>
                  <button
                    className="inline-flex min-h-11 items-center text-xs text-accent underline hover:text-accent-hover shell:min-h-0"
                    onClick={recientes.onReintentar}
                    type="button"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              {recientes.isLoadingHistory && recientes.sessions.length === 0 && (
                <div aria-hidden="true" className="flex flex-col gap-2 px-2 py-2">
                  <Esqueleto className="h-3.5 w-4/5" />
                  <Esqueleto className="h-3.5 w-3/5" />
                </div>
              )}
            </nav>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="flex-row items-center gap-1 border-t border-sidebar-border px-2 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={usuario.username}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-sidebar-accent"
              ref={usuarioBotonRef}
              type="button"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarFallback>{usuario.username.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm">{usuario.username}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {`${usuario.kcMenuRoles.length > 0 ? usuario.kcMenuRoles.join(", ") : "sin rol"} · LOCAL`}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onSelect={onAbrirApariencia}>Configuración</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          aria-label={temaResuelto === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent"
          onClick={() => onCambiarTema(temaResuelto === "oscuro" ? "claro" : "oscuro")}
          type="button"
        >
          {temaResuelto === "oscuro" ? (
            <Sun aria-hidden="true" className="size-4.5" />
          ) : (
            <Moon aria-hidden="true" className="size-4.5" />
          )}
        </button>
        <button
          aria-label="Cerrar sesión"
          className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent"
          onClick={onCerrarSesion}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-4.5" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
