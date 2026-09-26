# Rust Event Engine

The Rust service is the high-performance processing layer of CloudEvent Lab.

## Responsibilities

- Event validation
- SHA-256 payload checksum generation
- Event processing
- Processing latency measurement
- Metrics
- Concurrent HTTP handling with Tokio/Axum

## Run

```bash
cargo run
```

The service listens on:

```text
http://localhost:4100
```

## Endpoints

- `GET /health`
- `GET /metrics`
- `POST /process`

Example:

```bash
curl -X POST http://localhost:4100/process \
  -H "Content-Type: application/json" \
  -d '{"type":"ORDER_CREATED","source":"checkout-service","payload":{"orderId":"ORD-1001","amount":149.99}}'
```
