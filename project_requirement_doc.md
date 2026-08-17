# Multi-Agent Requirement-to-Backlog System — Build Plan

## Context

This is a greenfield project (no existing code) to build a multi-agent system that
ingests requirements (text/image/doc), detects cross-screen dependencies via vector
similarity (pgvector) + a knowledge graph (Neo4j), produces a validated SRS, and
publishes to Jira/Confluence with full traceability. The goal for today is a
**working, incrementally-testable POC**: each module gets its own smoke test/script
before the next module is built on top of it, so that when something breaks later,
the blast radius is obvious instead of "the whole pipeline is broken and I don't
know why."

Confirmed decisions:
- Stack: FastAPI + LangGraph + LangChain + OpenRouter (multimodal) + Postgres/pgvector
  + Neo4j + Jira/Confluence REST + React.js + Langfuse + RAGAS/LLM-judge.
- Default LLM: `google/gemini-2.0-flash-exp:free` on OpenRouter — free tier, natively
  multimodal (handles diagram images without a separate OCR step), fast enough for a
  POC loop. Wrapped behind an `LLMClient` interface so it's swappable (e.g. to
  `anthropic/claude-sonnet-4.5` later) without touching agent code.
- Build order (non-negotiable, per user): **text → SRS end-to-end first**, then add
  pgvector similarity, then Neo4j edges, then Jira/Confluence publishing, then
  image/doc input types. Jira/Confluence/Neo4j real credentials are available but
  intentionally wired in later phases, not day one.
- Frontend: React.js (matches target architecture; Streamlit was declined).
- Every phase ends with a concrete, runnable test (script, curl, or pytest) before
  moving to the next phase.

## Folder Structure

```
Sentinel/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entrypoint
│   │   ├── config.py                # env/settings (pydantic-settings)
│   │   ├── schemas/
│   │   │   ├── requirement.py       # common normalized input schema
│   │   │   ├── srs.py               # SRS output schema
│   │   │   └── dependency.py        # dependency edge schema
│   │   ├── llm/
│   │   │   ├── client.py            # LLMClient interface (OpenRouter impl)
│   │   │   └── prompts/             # prompt templates per agent
│   │   ├── agents/
│   │   │   ├── input_router.py
│   │   │   ├── analyzer.py
│   │   │   ├── dependency_impact.py
│   │   │   ├── srs_generator.py
│   │   │   └── publisher.py
│   │   ├── graph/
│   │   │   └── workflow.py          # LangGraph StateGraph wiring + checkpointer
│   │   ├── db/
│   │   │   ├── postgres.py          # sqlalchemy/asyncpg session + pgvector setup
│   │   │   ├── neo4j_client.py
│   │   │   └── models.py            # ORM models: requirements, audit_log, inputs
│   │   ├── integrations/
│   │   │   ├── jira_client.py
│   │   │   └── confluence_client.py
│   │   ├── parsers/
│   │   │   ├── pdf_parser.py
│   │   │   ├── docx_parser.py
│   │   │   └── xlsx_parser.py
│   │   ├── observability/
│   │   │   └── langfuse_setup.py
│   │   └── api/
│   │       └── routes.py            # /ingest, /review, /approve, /status endpoints
│   ├── tests/
│   │   ├── test_llm_client.py
│   │   ├── test_analyzer.py
│   │   ├── test_dependency_impact.py
│   │   ├── test_srs_generator.py
│   │   ├── test_graph_workflow.py
│   │   └── test_publisher.py
│   ├── scripts/
│   │   ├── smoke_llm.py             # standalone: call LLM, print response
│   │   ├── smoke_pgvector.py        # standalone: insert+query embeddings
│   │   ├── smoke_neo4j.py           # standalone: create+query a test edge
│   │   └── smoke_end_to_end.py      # text input -> SRS, no Jira/Confluence
│   ├── alembic/                     # DB migrations (pgvector table + audit log)
│   ├── docker-compose.yml           # postgres+pgvector, neo4j
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── (React app: input form, review checkpoint UI, status view)
└── eval/
    ├── ragas_dependency_eval.py
    └── llm_judge_srs_rubric.py
```

## Step-by-Step Build Plan

Each phase = build → isolated test → confirm before moving on.

### Phase 0 — Scaffolding & environment (foundation, ~20-30 min)
**What:** `docker-compose.yml` for Postgres+pgvector and Neo4j; FastAPI skeleton with
health check; `.env` for OpenRouter key, DB URLs; `config.py` via pydantic-settings.
**Why first:** Nothing else works without a running DB and a loadable config. This is
the cheapest thing to get wrong silently, so verify it in isolation.
**Test:** `docker compose up -d`, `curl localhost:8000/health` returns 200. Connect to
Postgres and Neo4j with a raw client to confirm they're reachable (not used for real
data yet).

### Phase 1 — LLMClient interface + OpenRouter (foundation)
**What:** `llm/client.py` defines an abstract `LLMClient` (methods: `complete(text)`,
`complete_vision(text, images)`), with an `OpenRouterClient` implementation using
`google/gemini-2.0-flash-exp:free`. Model name comes from config, not hardcoded.
**Why:** Every agent depends on this. Isolating it means a prompt/parsing bug in an
agent can never be confused with an API/auth bug.
**Test:** `scripts/smoke_llm.py` — send a fixed text prompt, print/verify the
response. Also test with a sample image to confirm multimodal works before Analyzer
needs it later.

### Phase 2 — Common requirement schema + Input Router (text-only for now)
**What:** `schemas/requirement.py` defines the normalized schema (source input id,
raw content, input type, metadata). `agents/input_router.py` detects type and wraps
text input into this schema. Doc/image detection stubbed to raise "not yet supported."
**Why:** Establishes the contract every downstream agent consumes — "no input type
hardcoded" requirement lives here.
**Test:** Unit test: feed a text string, assert schema fields populate correctly.

### Phase 3 — Analyzer Agent (text only)
**What:** `agents/analyzer.py` takes normalized input, prompts the LLM to extract
entities/flows/requirements into a structured list (pydantic-validated LLM output).
**Why:** First real "intelligence" step; needs to be correct and inspectable before
anything depends on its output.
**Test:** `test_analyzer.py` with 2-3 canned text requirements → assert expected
requirement objects come back with the right shape (not exact LLM wording, just
structure/field presence).

### Phase 4 — SRS Generator Agent (skip dependency detection for now)
**What:** `agents/srs_generator.py` takes Analyzer output and produces a structured
SRS document (pydantic schema: sections, requirement list, traceability id to source
input). No dependency annotations yet — that's added in Phase 6.
**Why:** Per the non-negotiable order — get text→SRS working end-to-end before adding
similarity/graph complexity. This is the first fully working vertical slice.
**Test:** `scripts/smoke_end_to_end.py` — text in, SRS out, printed/saved to a file.
This is your first demoable milestone.

### Phase 5 — LangGraph wiring for the above (Input Router → Analyzer → SRS Generator)
**What:** `graph/workflow.py` — a LangGraph `StateGraph` chaining the 3 nodes built so
far, with a Postgres-backed checkpointer (start using Postgres for real here).
**Why:** Validates orchestration/state-passing mechanics early, before more nodes and
a human-in-the-loop interrupt are added — easier to debug graph wiring with 3 nodes
than 6.
**Test:** `test_graph_workflow.py` — run the graph with a text input, assert final
state contains a valid SRS; assert checkpoint row exists in Postgres.

### Phase 6 — Dependency Impact Agent + pgvector
**What:** `db/postgres.py` pgvector table for requirement embeddings; agent embeds
new requirement, runs similarity search against stored ones, flags matches above a
confidence threshold as "flagged" (not auto-confirmed — non-negotiable). SRS Generator
updated to annotate flagged dependencies.
**Why:** First non-negotiable safety behavior (human review of ambiguous matches)
enters here; isolating pgvector logic means a bad embedding/query doesn't get
confused with an LLM extraction bug.
**Test:** `scripts/smoke_pgvector.py` standalone insert/query test, then
`test_dependency_impact.py`: seed 2 similar requirements, submit a 3rd similar one,
assert it's flagged with the right target id and NOT auto-confirmed.

### Phase 7 — Human review checkpoint (LangGraph interrupt)
**What:** Add a LangGraph `interrupt`/breakpoint node after SRS generation when
flagged dependencies exist; `/api/routes.py` exposes `/review/{run_id}` (GET pending,
POST approve/reject per flagged dependency) using the checkpointer to resume.
**Why:** This is the other non-negotiable — nothing proceeds to Neo4j/publish without
explicit approval. Testing this in isolation (before Neo4j/Jira exist) avoids
conflating "did the interrupt work" with "did the write to Neo4j work."
**Test:** Run graph with a flagged dependency, assert it pauses; POST an approval,
assert it resumes and state updates.

### Phase 8 — Neo4j integration
**What:** `db/neo4j_client.py`; Dependency Impact Agent cross-checks Neo4j for
existing confirmed structural edges (screen/requirement nodes) in addition to
pgvector; on human approval (Phase 7), Publisher (stub for now) writes the new
confirmed edge back to Neo4j.
**Why:** Builds on the already-tested pgvector + review-checkpoint logic; isolating
graph writes means you can verify "accumulated graph context" persists correctly
before Jira/Confluence enter the picture.
**Test:** `scripts/smoke_neo4j.py` standalone; `test_dependency_impact.py` extended
case: an existing Neo4j edge should be picked up as a high-confidence structural
match distinct from a pgvector-only similarity match.

### Phase 9 — Publisher Agent: Jira + Confluence (real credentials)
**What:** `integrations/jira_client.py`, `confluence_client.py`; Publisher Agent maps
approved SRS to Jira Epics/Stories and creates a Confluence page, writing back
traceability IDs (source input id + dependency ids) into both Jira issue
description/custom field and the Confluence page.
**Why:** Last non-negotiable to satisfy: nothing pushes here without prior approval
(Phase 7 already enforces that upstream). Real credentials are used only now, as
agreed — everything before this was testable without touching external services.
**Test:** `test_publisher.py` against a Jira/Confluence sandbox project — create one
issue + one page from a canned approved SRS, assert traceability fields are present,
then manually verify in the Jira/Confluence UI.

### Phase 10 — Observability (Langfuse) — thread through retroactively
**What:** `observability/langfuse_setup.py`; wrap each agent call (Phases 3-9) with
Langfuse tracing (latency, tokens, inputs/outputs).
**Why:** Deferred to its own phase so earlier phases aren't blocked on Langfuse setup,
but done before declaring the POC "done" since tracing every agent call is explicitly
required — retrofit is mechanical once agents are stable.
**Test:** Run `smoke_end_to_end.py` again, confirm a trace with all agent spans
appears in the Langfuse dashboard.

### Phase 11 — React frontend
**What:** Minimal React app: input form (text first), status/progress view, review
checkpoint UI (approve/reject flagged dependencies), final SRS + Jira/Confluence
links view.
**Why:** Backend is fully testable via scripts/curl through Phase 10; frontend is
last so UI bugs never mask backend bugs during the hardest debugging phases.
**Test:** Manual click-through: submit text requirement, see status update, approve a
flagged dependency, see Jira/Confluence links appear.

### Phase 12 (stretch, if time remains today) — Image/doc input types
**What:** `parsers/pdf_parser.py`, `docx_parser.py`, `xlsx_parser.py`; Input Router
extends to detect and normalize these; Analyzer already supports vision via
`complete_vision` from Phase 1, so diagram images route straight through.
**Why:** Explicitly last per the non-negotiable build order — text pipeline must be
fully proven first.
**Test:** Feed a sample PDF and a sample diagram image through
`smoke_end_to_end.py`, confirm both normalize into the same schema and produce a
valid SRS.

### Phase 13 (stretch) — Evaluation harness
**What:** `eval/ragas_dependency_eval.py` (retrieval/dependency-detection quality
against a small labeled set), `eval/llm_judge_srs_rubric.py` (LLM-judge rubric scoring
SRS completeness/clarity).
**Why:** Explicitly requested but not blocking the working POC; last because it
needs a stable pipeline to evaluate against.
**Test:** Run both scripts against 3-5 canned cases, confirm scores are produced and
sane (not necessarily tuned yet).

## Today's realistic cutoff

Given "at least a working POC today, refine daily," the recommended minimum bar for
today is **through Phase 9** (or Phase 8 if time is tight, with Publisher stubbed) —
that's the full non-negotiable loop (human approval → Jira/Confluence → traceability)
working end-to-end on text input. Phases 10-13 (Langfuse polish, React UI beyond
curl/Postman testing, image/doc input, eval harness) are reasonable to carry into
subsequent days.

## Verification Summary

Every phase has its own runnable check (listed above) so a break at Phase N only
requires re-running that phase's smoke test/pytest to localize the issue — no need
to re-run the whole pipeline to find where something broke.
