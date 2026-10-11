"""Configuracion compartida de ingesta.py y consulta.py.

Autor: Daniel Tovar
Desde: 2026-10-11
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
import os

RAIZ_REPO = Path(__file__).resolve().parents[2]
MODELO_EMBEDDING = "gemini/gemini-embedding-001"
DIMENSIONES_EMBEDDING = 768

# Reutiliza GEMINI_API_KEY de agents/orquestador/.env; MEMORIA_DATABASE_URL vive
# en agents/memoria/.env (ambos .env estan ignorados por git).
load_dotenv(RAIZ_REPO / "agents" / "orquestador" / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)


def gemini_api_key() -> str:
    valor = os.environ.get("GEMINI_API_KEY")
    if not valor:
        raise RuntimeError(
            "Falta GEMINI_API_KEY (agents/orquestador/.env o agents/memoria/.env)."
        )
    return valor


def database_url() -> str:
    valor = os.environ.get("MEMORIA_DATABASE_URL")
    if not valor:
        raise RuntimeError("Falta MEMORIA_DATABASE_URL en agents/memoria/.env.")
    return valor
