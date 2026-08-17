# Sentinel — Requirement to Backlog

A multi-agent pipeline that turns a raw requirement (text, image, or document) into a
validated SRS and a linked Jira/Confluence backlog, with human approval gates before
anything is written externally.

## What it does

1. **Input Router** — normalizes text, image, or document (PDF/DOCX/XLSX) input into a
   common schema.
2. **Guardrail Check** — LLM-based input-quality and prompt-injection/safety screening;
   hard-blocks bad input before it reaches the LLM analysis step.
3. **Analyzer** — extracts atomic requirements from the input (OpenAI, with vision
   support for UI wireframe images).
4. **Dependency Impact Agent** — dual-signal dependency detection: pgvector
   cosine-similarity search over previously stored requirements, plus Neo4j
   structural edges from confirmed past relationships.
5. **Quality Scorer** — flags vague/incomplete requirements with an LLM rubric and can
   suggest a refined description.
6. **Human Review** — a LangGraph interrupt; nothing is auto-confirmed. Flagged
   dependencies and quality issues require an explicit decision.
7. **SRS Generator** — produces a structured Software Requirements Specification.
8. **Publish Approval** — a second interrupt; nothing reaches Jira/Confluence without
   explicit approval.
9. **Publisher** — creates linked Jira Epics/Stories and a Confluence page, with
   traceability back to the source input.

> **Note:** the Guardrail, Dependency Impact, and Quality Scorer nodes are implemented
> and covered by tests, but are currently disabled in the live graph
> (`backend/app/graph/workflow.py`) while iterating on the Analyzer → SRS path in
> isolation. Re-enable by uncommenting the relevant nodes/edges.

## Architecture

- **Orchestration:** LangGraph — a stateful, checkpointed graph (Postgres-backed) so
  runs can pause for human review and resume exactly where they left off.
- **LLM:** OpenAI (`gpt-5-nano` primary, `gpt-5-mini` fallback) behind a swappable
  `LLMClient` interface.
- **Data stores:** PostgreSQL + pgvector (embeddings, LangGraph checkpoints), Neo4j
  (confirmed dependency graph), local `sentence-transformers` embedding model
  (`BAAI/bge-small-en-v1.5`, no external API).
- **Observability:** Langfuse tracing on every agent call, plus latency/token usage
  tracking surfaced in the API response.
- **Evaluation:** DeepEval (LLM-as-judge SRS quality rubric) and a custom
  precision/recall harness for dependency detection (`eval/`).
- **Backend:** FastAPI, fully async.
- **Frontend:** React + TypeScript + React Router, light/dark theme, component tests
  via Vitest.

## Project layout

```
backend/
  app/
    agents/         # one module per pipeline agent
    api/            # FastAPI routes
    db/             # Postgres + Neo4j clients, ORM models
    graph/          # LangGraph workflow + checkpointer
    integrations/   # Jira / Confluence REST clients
    llm/            # LLM client, prompts, usage tracking
    parsers/        # PDF / DOCX / XLSX parsing
    schemas/         # Pydantic models
  tests/            # pytest suite
  scripts/          # standalone smoke-test scripts
frontend/
  src/
    components/     # one folder per component (Component.tsx + .css + index.ts)
    pages/          # one page per pipeline step
    api/            # typed API client
    types/          # TS types matching backend schemas
eval/               # evaluation harness scripts
```

## Running locally

**Prerequisites:** Docker, Python 3.13+, Node 22+, `uv`.

### 1. Infrastructure

```bash
cd backend
docker compose up -d   # Postgres+pgvector, Neo4j
```

### 2. Backend

```bash
cd backend
uv venv .venv
uv pip install -r requirements.txt --python .venv/bin/python
cp .env.example .env   # then fill in your API keys / credentials
.venv/bin/uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Tests

```bash
# backend
cd backend && .venv/bin/python -m pytest tests/ -v

# frontend
cd frontend && npm run test
```

## Non-negotiables

- No automated decision (dependency confirmation, backlog publication) proceeds
  without explicit human approval.
- Every backlog item and Confluence page traces back to its source input and any
  confirmed dependencies.
- Confirmed dependencies persist into Neo4j so future runs benefit from accumulated
  context.
