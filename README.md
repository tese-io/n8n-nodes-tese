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
| **Tese** | Action | CRUD + FQL operations against TESE external API |
| **Tese Trigger** | Trigger | Webhook for activity formula and aggregation events |
| **Tese Finalize** | Action | Send computed results to TESE finalize endpoint |

## Operations (Tese node)

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

Create a **Tese API** credential:

| Field | Value |
|-------|-------|
| Base URL | `https://api.tese.io` (or your self-hosted backend) |
| API Key | Tenant external API key from TESE Settings |

Authentication uses `Authorization: Bearer <api_key>`.

## Typical workflow

1. Add **Tese Trigger** — choose Activity Formula or Activity Aggregation
2. Copy the webhook URL into your TESE question n8n config
3. Process the payload in n8n
4. Add **Tese Finalize** — set value/unit and finalize back to TESE

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

### 0.1.0

Initial release with Tese action node, Tese Trigger, and Tese Finalize nodes.
