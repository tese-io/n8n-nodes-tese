# n8n-nodes-tese

This is an [n8n](https://n8n.io/) community node package. It lets you integrate [TESE](https://tese.io) ESG workflows with n8n — trigger formula/aggregation webhooks, call the external API, and finalize results back to TESE.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

### npm (self-hosted n8n)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-tese
```

Restart n8n after installing.

### Development install

```bash
git clone <repo-url> n8n-nodes-tese
cd n8n-nodes-tese
npm install
npm run build
npm run dev
```

The `dev` command starts n8n on `http://localhost:5678` with hot reload.

## Nodes

| Node | Type | Description |
|------|------|-------------|
| **tese.io** | Action | CRUD + FQL operations against tese.io external API |
| **tese.io Trigger** | Trigger | Webhook for activity formula and aggregation events |
| **tese.io Finalize** | Action | Send computed results to tese.io finalize endpoint |

## Operations (tese.io node)

### Core (v0.1)
Facility, Activity, Metric Catalog, ESG Data, Framework, Audit Request, Report

### ESG workflow (v0.2)
Answer Bank, Question Bank, Aggregation, Formula Execution, Sustainability Target, Emission Factor, Framework Pack, Framework Pack Answer, Normalised Answer Bank, Composite KPI, Materiality Assessment, Validation Bank, Reporting Covenant, Evidence Manager, SPT, Device

### Reporting & tasks (v0.3)
Reporting Cycle, Task Approval, Task Issue, Task Workflow

See [LEARNING.md](./docs/LEARNING.md) for the full API parity matrix.

### Facility
List, Get, FQL Query, Create, Update, Delete

### Activity
List, Get, Create, Update, Archive

### Metric Catalog
List, Get, Get By Framework, FQL Query, Resolve By Codes, Get Filters, Create, Update, Delete

### ESG Data
FQL Query, Get By Date Range, Get By Category, Get, Create, Update, Delete

### Framework
List, Get, FQL Query, Create, Update, Delete

### Audit Request
FQL Query, Get, Get By Status, Get User Accessible, Create, Update, Add Message, Delete

### Report
List, Get, FQL Query, Get By Period, Check Published Exists, Submit For Review, Approve, Reject

## Credentials

Create a **tese.io API** credential:

| Field | Value |
|-------|-------|
| Base URL | `https://api.tese.io` (or your self-hosted backend) |
| API Key | Tenant external API key from TESE Settings |

Authentication uses `Authorization: Bearer <api_key>`.

## Typical workflow

1. Add **tese.io Trigger** — choose Activity Formula or Activity Aggregation
2. Copy the webhook URL into your TESE question n8n config
3. Process the payload in n8n
4. Add **tese.io Finalize** — set value/unit and finalize back to TESE

Use **Test workflow** on the trigger to load sample fixtures without a live webhook.

## Compatibility

- n8n >= 1.0
- Node.js >= 18
- Tested with `@n8n/node-cli` build toolchain

## Resources

- [TESE n8n integration docs](https://docs.tese.io/integrations/n8n)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Package learning guide](./docs/LEARNING.md)

## Version history

### 0.2.0

Add 16 v3 external API resources (answer bank, question bank, aggregation, formula execution, and more). Refactor action handlers into modular `nodes/Tese/actions/` structure. Add question bank loadOptions.

### 0.1.1

Rebrand node and credential display names to **tese.io** (internal node IDs unchanged).

### 0.1.0

Initial release with tese.io action node, tese.io Trigger, and tese.io Finalize nodes.
