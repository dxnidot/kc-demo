"""Busqueda semantica sobre la memoria vectorizada, por linea de comandos.

Uso (desde agents/, con el venv activo):
    python -m memoria.consulta "pregunta en español" [--k 5] [--coleccion backlog]

Autor: Daniel Tovar
Desde: 2026-10-11
"""

from __future__ import annotations

import argparse

import psycopg

from .config import database_url
from .embeddings import generar_embedding, vector_literal


def buscar(pregunta: str, k: int = 5, coleccion: str | None = None) -> list[tuple[str, str, float]]:
    embedding = vector_literal(generar_embedding(pregunta))
    if coleccion:
        consulta = """
            select fuente, contenido, embedding <=> %s::vector as distancia
            from fragmentos_memoria
            where coleccion = %s
            order by distancia
            limit %s
        """
        parametros: tuple[object, ...] = (embedding, coleccion, k)
    else:
        consulta = """
            select fuente, contenido, embedding <=> %s::vector as distancia
            from fragmentos_memoria
            order by distancia
            limit %s
        """
        parametros = (embedding, k)

    with psycopg.connect(database_url()) as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(consulta, parametros)
            return cursor.fetchall()


def main() -> None:
    parser = argparse.ArgumentParser(description="Busca fragmentos relevantes en la memoria vectorizada.")
    parser.add_argument("pregunta")
    parser.add_argument("--k", type=int, default=5)
    parser.add_argument("--coleccion", default=None)
    args = parser.parse_args()

    resultados = buscar(args.pregunta, k=args.k, coleccion=args.coleccion)
    if not resultados:
        print("Sin resultados (¿ya corriste la ingesta?).")
        return

    for fuente, contenido, distancia in resultados:
        similitud = 1 - distancia
        print(f"\n[{similitud:.2f}] {fuente}")
        print(contenido[:400])


if __name__ == "__main__":
    main()
