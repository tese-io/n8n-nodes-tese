# TESE n8n Community Nodes — Learning Guide

This document maps TESE platform concepts to n8n node patterns and explains how the package is structured.

## Package layout

| Path | Purpose |
|------|---------|
| `credentials/TeseApi.credentials.ts` | Base URL + Bearer API key credential |
| `nodes/Tese/` | Main action node (CRUD + FQL against `/api/v3/external/*`) |
| `nodes/TeseTrigger/` | Webhook trigger for activity formula / aggregation payloads |
| `nodes/TeseFinalize/` | Unified finalize + legacy callback node |
| `nodes/shared/teseApiRequest.ts` | Shared HTTP helper with `NodeApiError` mapping |
| `nodes/shared/finalizeHelpers.ts` | Finalize URL, headers, and body builders |
| `nodes/shared/testFixtures.ts` | Manual-test fixtures for the trigger node |

## n8n patterns used

### Programmatic action node (`Tese`)

The main node uses the **resource + operation** pattern recommended by n8n:

1. `properties.ts` defines UI fields with `displayOptions.show` keyed on `resource` and `operation`.
2. `executeRouter.ts` switches on resource/operation and calls `teseApiRequest`.
3. `Tese.node.ts` wires credentials, loadOptions (`getFacilities`, `getFrameworks`), and delegates execute to the router.

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

| Resource | Base path | MCP tool prefix |
|----------|-----------|-----------------|
| Facility | `/api/v3/external/facilities` | `tese_external_*_facilit*` |
| Activity | `/api/v3/external/esg/activity-store` | `tese_external_*_activit*` |
| Metric Catalog | `/api/v3/external/esg/metric-catalog` | `tese_external_*_metric*` |
| ESG Data | `/api/v3/external/esg/esg-data` | `tese_external_*_esg_data*` |
| Framework | `/api/v3/external/esg/framework` | `tese_external_*_framework*` |
| Audit Request | `/api/v3/external/audit-requests` | `tese_external_*_audit*` |
| Report | `/api/v3/external/reports` | (external reports API) |

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
Tese Trigger (activityFormula)
  → [Your computation nodes]
  → Tese Finalize (finalizeActivity)
```

For aggregations:

```
Tese Trigger (activityAggregation)
  → [Aggregate activities]
  → Tese Finalize (finalizeAggregation)
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

Create a **Tese API** credential in n8n with:

- **Base URL**: your TESE backend (e.g. `https://api.tese.io`)
- **API Key**: tenant external API key from TESE Settings

The credential test hits `GET /api/v1/health-check/get`.

Finalize operations can run **without** credentials when the trigger payload includes `finalize_token`.
