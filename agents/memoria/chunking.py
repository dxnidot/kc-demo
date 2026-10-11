"""Trocea texto Markdown en fragmentos por parrafo, acotados a un tamano maximo."""

from __future__ import annotations

MAXIMO_CARACTERES_POR_DEFECTO = 1600


def trocear(texto: str, maximo_caracteres: int = MAXIMO_CARACTERES_POR_DEFECTO) -> list[str]:
    parrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    fragmentos: list[str] = []
    actual = ""
    for parrafo in parrafos:
        candidato = f"{actual}\n\n{parrafo}" if actual else parrafo
        if len(candidato) <= maximo_caracteres:
            actual = candidato
            continue
        if actual:
            fragmentos.append(actual)
        actual = parrafo[:maximo_caracteres] if len(parrafo) > maximo_caracteres else parrafo
    if actual:
        fragmentos.append(actual)
    return fragmentos
