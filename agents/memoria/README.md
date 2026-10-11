# Memoria vectorizada (AG-09)

Búsqueda semántica sobre los documentos del propio proyecto (`docs/archive/**`, `docs/snapshot-<fecha>.md`), para usar durante las sesiones de trabajo en vez de releer archivos completos. Requiere el Postgres de [`infra/memoria/`](../../infra/memoria/) levantado.

## Primer uso

```powershell
cd agents
Copy-Item memoria\.env.example memoria\.env
# Edita memoria\.env: la URL debe coincidir con la contraseña de infra/memoria/.env.
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m memoria.ingesta
```

`GEMINI_API_KEY` se reutiliza de `agents/orquestador/.env` (no hace falta duplicarla).

## Ingesta

```powershell
python -m memoria.ingesta
```

Trocea cada `.md` de las colecciones definidas en `ingesta.py` (`backlog`, `decisiones`, `bugs`, `planes`, `guia`, `snapshot`), genera sus embeddings en lotes de 20 (para no agotar el cupo free tier de la API, que reintenta solo con backoff ante un 429) y reconstruye `fragmentos_memoria` por completo. Vuelve a correrse las veces que haga falta — no duplica filas, las reemplaza todas.

## Consulta

```powershell
python -m memoria.consulta "pregunta en español" --k 5
python -m memoria.consulta "pregunta" --coleccion backlog
```

Devuelve los fragmentos más cercanos por similitud de coseno (`embedding <=> consulta`), con su fuente (`archivo · fragmento N`) y un score de similitud (1 − distancia).

## Decisiones (detalle completo en `AG-09`)

- Motor: Postgres + `pgvector` (no Supabase), índice HNSW.
- Embeddings: `gemini/gemini-embedding-001` vía LiteLLM, truncados a 768 dimensiones, reutilizando `GEMINI_API_KEY`.
- Troceo: por párrafo, hasta ~1600 caracteres por fragmento (`chunking.py`).
- El contenido indexado es siempre texto de los propios documentos del proyecto — nunca datos reales, repo público.
