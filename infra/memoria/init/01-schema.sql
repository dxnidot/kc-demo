-- Se ejecuta una sola vez, en el primer arranque del volumen (docker-entrypoint-initdb.d).
create extension if not exists vector;

create table if not exists colecciones_memoria (
    clave text primary key,
    nombre text not null
);

create table if not exists fragmentos_memoria (
    id bigserial primary key,
    coleccion text not null references colecciones_memoria (clave),
    fuente text not null,
    contenido text not null,
    -- 768 dimensiones: gemini-embedding-001 truncado (AG-09, ver docs/archive/backlog/).
    embedding vector(768) not null,
    creado_en timestamptz not null default now()
);

-- HNSW: sin paso de entrenamiento, buena relación velocidad/recall para el
-- volumen pequeño de este lab (README de pgvector).
create index if not exists fragmentos_memoria_embedding_hnsw
    on fragmentos_memoria using hnsw (embedding vector_cosine_ops);
