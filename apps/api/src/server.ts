import express from "express";
import cors from "cors";
import { EventEngine, defaultTopology, type EventRequest } from "@cloud-event-lab/event-core";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const rustEngineUrl = process.env.RUST_ENGINE_URL ?? "http://localhost:4100";
const engine = new EventEngine(defaultTopology());

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cloud-event-lab-api",
    rustEngine: rustEngineUrl,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/topology", (_req, res) => res.json(engine.topology()));
app.get("/api/events", (_req, res) => res.json(engine.events()));
app.get("/api/metrics", async (_req, res) => {
  const local = engine.metrics();
  let rust = null;
  try {
    const response = await fetch(`${rustEngineUrl}/metrics`);
    if (response.ok) rust = await response.json();
  } catch {}
  res.json({ ...local, rust });
});

app.post("/api/events/simulate", async (req, res) => {
  const body = req.body as Partial<EventRequest>;
  if (!body.type || !body.source) {
    return res.status(400).json({ error: "type and source are required" });
  }

  const request = {
    type: body.type,
    source: body.source,
    payload: body.payload ?? {}
  };

  let rustResult: unknown = null;
  try {
    const response = await fetch(`${rustEngineUrl}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    if (response.ok) rustResult = await response.json();
  } catch {
    // Demo mode: local engine remains available when Rust is offline.
  }

  const event = await engine.simulate(request);
  return res.status(201).json({ ...event, rustResult });
});

app.post("/api/topology/reset", (_req, res) => {
  engine.reset();
  res.json(engine.topology());
});

app.listen(port, () => {
  console.log(`CloudEvent Lab API listening on http://localhost:${port}`);
});
