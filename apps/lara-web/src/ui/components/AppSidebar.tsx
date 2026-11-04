import type { ReactNode } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { Usuario } from "../../domain/Usuario";
import type { PreferenciaTema } from "../../domain/Apariencia";
import { usarMocks } from "../../infrastructure/composition";
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
}

export interface GrupoNavSidebar {
  titulo: string;
  items: EntradaNavSidebar[];
}

interface AppSidebarProps {
  grupos: GrupoNavSidebar[];
  tema: PreferenciaTema;
  usuario: Usuario;
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
  tema,
  usuario,
  onAbrirApariencia,
  onCambiarTema,
  onCerrarSesion,
}: AppSidebarProps) {
  const { pathname } = useLocation();
  const temaResuelto = useTemaResuelto(tema);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <LaraLogo />
          <span className="truncate text-brand font-semibold">Lara</span>
          <IndicadorMock activo={usarMocks} />
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        {grupos.map((grupo) => (
          <SidebarGroup key={grupo.titulo}>
            <SidebarGroupLabel>{grupo.titulo}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.items.map((item) =>
                  item.hijos ? (
                    <SidebarMenuItem key={item.ruta}>
                      <SidebarMenuButton tooltip={item.etiqueta}>
                        {item.icono}
                        <span>{item.etiqueta}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.hijos.map((hijo) => (
                          <SidebarMenuSubItem key={hijo.ruta}>
                            <SidebarMenuSubButton asChild isActive={pathname === hijo.ruta}>
                              <Link to={hijo.ruta}>{hijo.etiqueta}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuItem key={item.ruta}>
                      <SidebarMenuButton asChild isActive={pathname === item.ruta} tooltip={item.etiqueta}>
                        <Link aria-current={pathname === item.ruta ? "page" : undefined} to={item.ruta}>
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
      </SidebarContent>

      <SidebarFooter className="flex-row items-center gap-1 border-t border-sidebar-border px-2 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={`Usuario: ${usuario.username}`}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-sidebar-accent"
              type="button"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarFallback>{usuario.username.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                {usuario.username}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onSelect={onAbrirApariencia}>Apariencia</DropdownMenuItem>
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
