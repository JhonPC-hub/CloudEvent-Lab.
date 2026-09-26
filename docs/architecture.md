# Architecture

CloudEvent Lab separates the visual application from event simulation, high-performance processing and cloud providers.

## Layers

1. **Web UI** — React, TypeScript and CSS.
2. **Node API** — Express REST API and orchestration.
3. **Rust Event Engine** — validation, checksums, processing latency and concurrent event handling.
4. **Event Core** — local topology simulation and history.
5. **Provider adapters** — AWS and Azure abstraction boundaries.
6. **Infrastructure** — Terraform reference resources.

## Runtime flow

```text
Browser
   |
   v
Node.js API :4000
   |
   +------> Rust Engine :4100
   |             |
   |             +--> validate
   |             +--> checksum
   |             +--> process
   |             +--> metrics
   |
   +------> Event Core
   |
   +------> AWS / Azure adapters
```

The Rust service is independently deployable and can later be placed behind a queue or service mesh without changing the frontend.
