"""Trocea los documentos del proyecto, genera sus embeddings y los guarda en
la base de memoria vectorizada (ver infra/memoria/ y AG-09 en el backlog).

Vuelve a correrse sin duplicar filas: cada corrida vacia fragmentos_memoria
y la reconstruye entera (el corpus del lab es pequeno, no hace falta diff).

Uso (desde agents/, con el venv activo):
    python -m memoria.ingesta

Autor: Daniel Tovar
Desde: 2026-10-11
"""

from __future__ import annotations

from pathlib import Path

import psycopg

from .chunking import trocear
from .config import RAIZ_REPO, database_url
from .embeddings import generar_embeddings, vector_literal

FUENTES: tuple[tuple[str, str, str], ...] = (
    ("backlog", "Historias del backlog", "docs/archive/backlog/*.md"),
    ("decisiones", "Decisiones de arquitectura (ADR)", "docs/archive/decisions/*.md"),
    ("bugs", "Incidencias corregidas", "docs/archive/bugs/*.md"),
    ("planes", "Planes de trabajo cerrados", "docs/archive/plans/*.md"),
    ("guia", "Guías de referencia", "docs/archive/guia-roles-y-permisos.md"),
    ("snapshot", "Estado vivo del proyecto", "docs/snapshot-*.md"),
)
TAMANO_LOTE = 20


def _archivos(patron: str) -> list[Path]:
    return sorted(RAIZ_REPO.glob(patron))


def _lotes(elementos: list, tamano: int):
    for inicio in range(0, len(elementos), tamano):
        yield elementos[inicio : inicio + tamano]


def ingerir() -> None:
    pendientes: list[tuple[str, str, str]] = []  # coleccion, fuente, contenido
    colecciones_vistas: set[tuple[str, str]] = set()

    for clave, nombre, patron in FUENTES:
        archivos = _archivos(patron)
        if not archivos:
            continue
        colecciones_vistas.add((clave, nombre))
        for archivo in archivos:
            texto = archivo.read_text(encoding="utf-8").strip()
            if not texto:
                continue
            ruta_relativa = archivo.relative_to(RAIZ_REPO).as_posix()
            for indice, fragmento in enumerate(trocear(texto), start=1):
                fuente = f"{ruta_relativa} · fragmento {indice}"
                pendientes.append((clave, fuente, fragmento))

    if not pendientes:
        print("No se encontraron documentos para indexar.")
        return

    filas: list[tuple[str, str, str, str]] = []  # coleccion, fuente, contenido, vector
    for lote in _lotes(pendientes, TAMANO_LOTE):
        textos = [fragmento for _, _, fragmento in lote]
        embeddings = generar_embeddings(textos)
        for (clave, fuente, fragmento), embedding in zip(lote, embeddings):
            filas.append((clave, fuente, fragmento, vector_literal(embedding)))
            print(f"  {fuente} ({len(fragmento)} caracteres)")

    with psycopg.connect(database_url()) as conexion:
        with conexion.cursor() as cursor:
            for clave, nombre in sorted(colecciones_vistas):
                cursor.execute(
                    """
                    insert into colecciones_memoria (clave, nombre)
                    values (%s, %s)
                    on conflict (clave) do update set nombre = excluded.nombre
                    """,
                    (clave, nombre),
                )
            cursor.execute("truncate table fragmentos_memoria")
            cursor.executemany(
                """
                insert into fragmentos_memoria (coleccion, fuente, contenido, embedding)
                values (%s, %s, %s, %s::vector)
                """,
                filas,
            )
        conexion.commit()

    print(f"\nListo: {len(filas)} fragmentos en {len(colecciones_vistas)} colecciones.")


if __name__ == "__main__":
    ingerir()
