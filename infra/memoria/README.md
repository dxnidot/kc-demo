# Memoria vectorizada del lab

PostgreSQL 17 + la extensión [`pgvector`](https://github.com/pgvector/pgvector) con Docker Compose, en un contenedor propio y separado de Keycloak y de `kc-finanzas` (puerto 5434). Guarda fragmentos de texto embebidos para búsqueda semántica — ver [`AG-09`](../../docs/archive/backlog/AG-09-memoria-vectorizada-rag.md).

## Primer arranque

```powershell
Copy-Item .env.example .env
# Edita .env: pon tu propia contraseña (la de ejemplo no sirve).
docker compose up -d
```

El esquema (`create extension vector`, tablas `colecciones_memoria`/`fragmentos_memoria` e índice HNSW) se aplica solo, desde [`init/01-schema.sql`](init/01-schema.sql), la primera vez que se crea el volumen `memoria-pgdata`. Si ya existe el volumen, un cambio en ese `.sql` **no** se vuelve a aplicar — hay que recrear el volumen o migrar a mano.

## Por qué este motor y no otro

- **Postgres + `pgvector`, no Supabase:** el stack self-hosted de Supabase son 8-11 servicios y ≥4 GB RAM solo para tener algo que una extensión resuelve en cualquier Postgres (`CREATE EXTENSION vector`).
- **Índice HNSW, no IVFFlat:** mejor relación velocidad/recall y sin paso de entrenamiento — adecuado para el volumen pequeño de este lab. Fuente: [README de pgvector](https://github.com/pgvector/pgvector).
- **Imagen `pgvector/pgvector:pg17`:** la mantiene el propio proyecto `pgvector`, ya con la extensión compilada — evita construir una imagen a mano.

## Reglas

- Igual que Keycloak y `kc-finanzas`: nunca `docker compose down -v` (borra el volumen `memoria-pgdata`).
- Puerto atado a `127.0.0.1:5434`, igual que el resto de la infraestructura local del lab.
- Contenido de los fragmentos: solo texto de los propios documentos del proyecto (`docs/archive/**`, `docs/snapshot-<fecha>.md`); nada de datos reales ni secretos, repo público.
