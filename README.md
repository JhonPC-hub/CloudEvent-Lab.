# CloudEvent Lab

CloudEvent Lab is an interactive multi-cloud event-driven architecture laboratory built with React, TypeScript and Node.js.

It lets developers visually compose AWS and Azure event components, send simulated events through the architecture, inspect event payloads, and observe delivery states in real time.

## Highlights

- Interactive visual event pipeline
- AWS + Azure event components
- Drag-and-drop style architecture builder
- Real-time event simulation
- Event inspector with JSON payloads
- Delivery states: idle, processing, success, failed
- Event history and metrics
- REST API
- Provider abstraction layer
- Terraform reference infrastructure
- Docker Compose
- GitHub Actions CI
- Responsive CSS interface
- Demo mode that works without cloud credentials

## Architecture

```text
React Dashboard
      |
      v
Node.js REST API
      |
      +------------------+
      |                  |
      v                  v
Event Simulator     Provider Adapters
                         |
                +--------+--------+
                |                 |
               AWS              Azure
                |                 |
             Lambda           Functions
             SQS              Service Bus
             EventBridge      Event Grid
             API Gateway
```


## Rust Event Engine

CloudEvent Lab includes a real Rust processing service instead of using Rust as a decorative dependency.

The engine is responsible for:

- event validation
- SHA-256 payload checksums
- processing latency measurements
- concurrent HTTP event processing
- event metrics

It uses **Rust + Tokio + Axum** and listens on port `4100`.

```text
React
  ↓
Node.js API
  ↓
Rust Event Engine
  ↓
AWS / Azure event architecture
```

Run it directly:

```bash
cd services/event-engine
cargo run
```

Or start the complete stack:

```bash
docker compose up --build
```

## Project structure

```text
cloud-event-lab/
├── apps/
│   ├── api/
│   │   └── src/
│   └── web/
│       └── src/
├── packages/
│   ├── event-core/
│   └── providers/
│       ├── aws/
│       └── azure/
├── infrastructure/
│   ├── aws/
│   └── azure/
├── examples/
├── docs/
├── .github/workflows/
├── docker-compose.yml
├── package.json
└── .env.example
```

## Quick start

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The API runs on `http://localhost:4000`.

## Docker

```bash
docker compose up --build
```

## Cloud credentials

The default application uses deterministic local simulation adapters. No AWS or Azure credentials are required for the demo.

For real provider integrations, configure credentials through your environment or workload identity. Never commit credentials to GitHub.

## Terraform

The Terraform directories are intentionally reference infrastructure. Review and adapt them to your AWS/Azure account, region, naming conventions and IAM/RBAC policies before applying.

```bash
cd infrastructure/aws
terraform init
terraform validate
```

and:

```bash
cd infrastructure/azure
terraform init
terraform validate
```

## API

- `GET /health`
- `GET /api/topology`
- `GET /api/events`
- `GET /api/metrics`
- `POST /api/events/simulate`
- `POST /api/topology/reset`

Example:

```bash
curl -X POST http://localhost:4000/api/events/simulate \
  -H "Content-Type: application/json" \
  -d '{"type":"ORDER_CREATED","source":"checkout-service","payload":{"orderId":"ORD-1001","amount":149.99}}'
```

## Production note

The local simulator is fully runnable. The cloud adapters and Terraform are intentionally separated from the simulation layer so real AWS/Azure SDK clients can be enabled without coupling the UI to provider-specific code.

This repository is a portfolio/reference implementation, not a claim that arbitrary production cloud accounts are automatically configured.

## License

MIT
