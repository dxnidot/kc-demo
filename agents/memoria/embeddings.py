"""Genera embeddings con gemini/gemini-embedding-001 via LiteLLM.

Confirmado en el paquete instalado (no solo en documentacion web): el
provider "gemini" de LiteLLM traduce el parametro `dimensions` a
`outputDimensionality` de la API de Gemini
(litellm/llms/vertex_ai/gemini_embeddings/batch_embed_content_transformation.py:202-203).
"""

from __future__ import annotations

import time

import litellm
from litellm.exceptions import RateLimitError

from .config import DIMENSIONES_EMBEDDING, MODELO_EMBEDDING, gemini_api_key

_REINTENTOS = 4
_ESPERA_SEGUNDOS = 45


def generar_embeddings(textos: list[str]) -> list[list[float]]:
    """Genera embeddings para varios textos en una sola llamada (ahorra cupo de la API free tier)."""
    for intento in range(1, _REINTENTOS + 1):
        try:
            respuesta = litellm.embedding(
                model=MODELO_EMBEDDING,
                input=textos,
                dimensions=DIMENSIONES_EMBEDDING,
                api_key=gemini_api_key(),
            )
            return [item["embedding"] for item in respuesta.data]
        except RateLimitError:
            if intento == _REINTENTOS:
                raise
            print(f"  (429, reintento {intento}/{_REINTENTOS} en {_ESPERA_SEGUNDOS}s...)")
            time.sleep(_ESPERA_SEGUNDOS)
    raise RuntimeError("No se pudo generar el embedding tras los reintentos.")


def generar_embedding(texto: str) -> list[float]:
    return generar_embeddings([texto])[0]


def vector_literal(embedding: list[float]) -> str:
    """Representación textual que Postgres/pgvector acepta al castear con `::vector`."""
    return "[" + ",".join(repr(valor) for valor in embedding) + "]"
