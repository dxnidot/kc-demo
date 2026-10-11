import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { claseFocoInterno } from "./foco";

interface SidebarItemProps {
  active?: boolean;
  children: ReactNode;
  icono?: ReactNode;
  indentado?: boolean;
  onClick?: () => void;
  reciente?: boolean;
  to: string;
}

/**
 * Enlace lateral con estado de página accesible; la variante reciente es la fila compacta del historial.
 * @author Daniel
 * @since 2026-09-30
 * @modified Daniel Tovar 2026-09-30 Añade ícono y variante compacta para Recientes.
 * @modified Daniel Tovar 2026-09-30 Foco hacia adentro (no se recorta) y 44px táctiles en angosto.
 * @modified Daniel Tovar 2026-10-11 Variante indentada para los hijos de SidebarGroup.
 */
export function SidebarItem({
  active = false,
  children,
  icono,
  indentado = false,
  onClick,
  reciente = false,
  to,
}: SidebarItemProps) {
  const base = reciente
    ? "min-h-11 py-2 text-compact text-muted shell:min-h-9"
    : "min-h-11 gap-3 text-sm text-text-2 shell:min-h-9.5";
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center truncate rounded-button text-left transition-colors ${claseFocoInterno} ${base} ${
        indentado ? "pl-9 pr-3" : "px-3"
      } ${active ? "bg-surface-active text-text" : "hover:bg-surface-hover hover:text-text"}`}
      onClick={onClick}
      to={to}
    >
      {icono}
      <span className="truncate">{children}</span>
    </Link>
  );
}

interface SidebarGroupHijo {
  activo: boolean;
  etiqueta: string;
  to: string;
}

interface SidebarGroupProps {
  /** Si el grupo arranca abierto (p. ej. porque la ruta activa es uno de sus hijos). */
  abiertoPorDefecto?: boolean;
  etiqueta: string;
  hijos: SidebarGroupHijo[];
  icono?: ReactNode;
}

/**
 * Entrada del sidebar con hijos desplegables (acordeón): botón con `aria-expanded` y `aria-controls`
 * que muestra u oculta una lista de `SidebarItem` indentados. Navegable con teclado: el botón responde
 * a Enter/Espacio de forma nativa y, al abrirse, los hijos son enlaces normales con 44px de alto mínimo.
 * @author Daniel Tovar
 * @since 2026-10-11
 */
export function SidebarGroup({ abiertoPorDefecto = false, etiqueta, hijos, icono }: SidebarGroupProps) {
  // Estado derivado en el propio render (sin efecto): mientras nadie lo haya tocado a mano, el grupo
  // sigue la ruta activa (abiertoPorDefecto) sin esperar un ciclo extra de render tras una navegación
  // (p. ej. una ruta vieja que redirige a uno de sus hijos).
  const [anulado, setAnulado] = useState<boolean | null>(null);
  const abierto = anulado ?? abiertoPorDefecto;
  const idHijos = `grupo-${etiqueta.replace(/\W+/g, "-").toLowerCase()}`;
  const activo = hijos.some((hijo) => hijo.activo);

  return (
    <div className="flex flex-col gap-0.5">
      <button
        aria-controls={idHijos}
        aria-expanded={abierto}
        className={`flex min-h-11 w-full items-center gap-3 rounded-button px-3 text-left text-sm transition-colors shell:min-h-9.5 ${claseFocoInterno} ${
          activo ? "text-text" : "text-text-2 hover:bg-surface-hover hover:text-text"
        }`}
        onClick={() => setAnulado(!abierto)}
        type="button"
      >
        {icono}
        <span className="flex-1 truncate">{etiqueta}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      {abierto && (
        <div className="flex flex-col gap-0.5" id={idHijos} role="group">
          {hijos.map((hijo) => (
            <SidebarItem active={hijo.activo} indentado key={hijo.to} to={hijo.to}>
              {hijo.etiqueta}
            </SidebarItem>
          ))}
        </div>
      )}
    </div>
  );
}
