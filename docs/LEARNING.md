# TESE n8n Community Nodes — Learning Guide

This document maps TESE platform concepts to n8n node patterns and explains how the package is structured.

## Package layout

| Path | Purpose |
|------|---------|
| `credentials/TeseApi.credentials.ts` | Base URL + Bearer API key credential |
| `nodes/Tese/` | Main action node (CRUD + FQL against `/api/v3/external/*`) |
| `nodes/Tese/actions/` | Per-resource action handlers (v0.2 modular layout) |
| `nodes/TeseTrigger/` | Webhook trigger for activity formula / aggregation payloads |
| `nodes/TeseFinalize/` | Unified finalize + legacy callback node |
| `nodes/shared/teseApiRequest.ts` | Shared HTTP helper with `NodeApiError` mapping |
| `nodes/shared/finalizeHelpers.ts` | Finalize URL, headers, and body builders |
| `nodes/shared/testFixtures.ts` | Manual-test fixtures for the trigger node |

## n8n patterns used

### Programmatic action node (`Tese`)

The main node uses the **resource + operation** pattern recommended by n8n:

1. `properties.ts` defines UI fields with `displayOptions.show` keyed on `resource` and `operation`.
2. `actions/<resource>.ts` handlers call `teseApiRequest` via shared helpers.
3. `executeRouter.ts` delegates to `actions/index.ts` router.
4. `Tese.node.ts` wires credentials, loadOptions, and execute.

This mirrors the MCP tools in `tese-mcp-server` — each MCP tool maps 1:1 to a resource/operation pair hitting the same external API paths.

### Webhook trigger (`TeseTrigger`)

- Declares a POST webhook at path `tese`.
- On **manual test** (`getMode() === 'manual'`), returns fixtures from `testFixtures.ts` so workflows can be built without a live TESE webhook.
- On production webhooks, passes the POST body through as workflow items.

### Finalize node (`TeseFinalize`)

TESE sends short-lived `finalize_token` JWTs in webhook payloads. The finalize node:

1. Extracts the token via `extractFinalizeToken` (supports `finalize_token` or `finalize_contract.auth.bearer`).
2. Builds idempotent headers (`Idempotency-Key`, `X-Workflow-Id`, `X-Run-Id`, `X-Correlation-Id`).
3. POSTs to `POST /api/v3/external/esg/aggregation/n8n/finalize` with `kind`: `activity`, `aggregation`, or `formula`.

The **Legacy Callback** operation POSTs to `callback_url` from older webhook payloads for backward compatibility.

## TESE API mapping

All action node routes use `/api/v3/external/*` with `Authorization: Bearer <api_key>`.

| Resource | Base path | In node (v0.2) |
|----------|-----------|----------------|
| Facility | `/api/v3/external/facilities` | Yes |
| Activity | `/api/v3/external/esg/activity-store` | Yes |
| Metric Catalog | `/api/v3/external/esg/metric-catalog` | Yes |
| ESG Data | `/api/v3/external/esg/esg-data` | Yes |
| Framework | `/api/v3/external/esg/framework` | Yes |
| Audit Request | `/api/v3/external/audit-requests` | Yes |
| Report | `/api/v3/external/reports` | Yes |
| Answer Bank | `/api/v3/external/esg/answer-bank` | Yes |
| Question Bank | `/api/v3/external/esg/question-bank` | Yes |
| Aggregation | `/api/v3/external/esg/aggregation` | Yes |
| Formula Execution | `/api/v3/external/esg/formula/execution` | Yes |
| Sustainability Target | `/api/v3/external/esg/sustainability-targets` | Yes |
| Emission Factor | `/api/v3/external/esg/emission-factors` | Yes |
| Framework Pack | `/api/v3/external/esg/framework-pack` | Yes |
| Framework Pack Answer | `/api/v3/external/esg/framework-pack-answer` | Yes |
| Normalised Answer Bank | `/api/v3/external/esg/normalised-answer-bank` | Yes |
| Composite KPI | `/api/v3/external/esg/composite-kpi` | Yes |
| Materiality Assessment | `/api/v3/external/esg/materiality-assessments` | Yes |
| Validation Bank | `/api/v3/external/esg/validation-bank` | Yes |
| Reporting Covenant | `/api/v3/external/esg/reporting-covenants` | Yes |
| Evidence Manager | `/api/v3/external/esg/evidence-manager` | Yes |
| SPT | `/api/v3/external/esg/spt` | Yes |
| Device | `/api/v3/external/devices` | Yes |
| Reporting Cycle | `/api/v3/external/reporting-cycle` | Yes |
| Task Approval | `/api/v3/external/task-manager/approvals` | Yes |
| Task Issue | `/api/v3/external/task-manager/issues` | Yes |
| Task Workflow | `/api/v3/external/task-manager/workflows` | Yes |

### FQL operations

Several resources support **FQL** (Filter Query Language) via `POST .../fql` with a JSON body containing `filter`, `sort`, `page`, and `limit`.

### Finalize endpoint

```
POST /api/v3/external/esg/aggregation/n8n/finalize
Authorization: Bearer <finalize_token or api_key>
Content-Type: application/json
Idempotency-Key: <uuid>
X-Workflow-Id: <n8n workflow id>
X-Run-Id: <execution id>
X-Correlation-Id: <uuid>

{
  "kind": "activity" | "aggregation" | "formula",
  "tenant_id": "...",
  "facility_id": "...",
  "reporting_cycle_id": "...",
  "value": 123.45,
  "unit_code": "kg"
}
```

## Typical workflow

```
tese.io Trigger (activityFormula)
  → [Your computation nodes]
  → tese.io Finalize (finalizeActivity)
```

For aggregations:

```
tese.io Trigger (activityAggregation)
  → [Aggregate activities]
  → tese.io Finalize (finalizeAggregation)
```

## Development commands

```bash
npm install
npm run build      # compile TypeScript
npm run lint       # ESLint via n8n-node CLI
npm test           # unit tests for finalizeHelpers
npm run dev        # hot-reload in local n8n
```

## Credentials

Create a **tese.io API** credential in n8n with:

- **Base URL**: your TESE backend (e.g. `https://api.tese.io`)
- **API Key**: tenant external API key from TESE Settings

The credential test hits `GET /api/v1/health-check/get`.

Finalize operations can run **without** credentials when the trigger payload includes `finalize_token`.
