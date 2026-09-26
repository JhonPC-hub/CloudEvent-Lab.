export type Cloud = "AWS" | "AZURE";

export type NodeKind =
  | "api-gateway" | "lambda" | "sqs" | "eventbridge"
  | "azure-function" | "service-bus" | "event-grid" | "consumer";

export type NodeStatus = "IDLE" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface EventNode {
  id: string;
  name: string;
  provider: Cloud;
  kind: NodeKind;
  status: NodeStatus;
  x: number;
  y: number;
}

export interface EventEdge {
  from: string;
  to: string;
}

export interface EventTopology {
  nodes: EventNode[];
  edges: EventEdge[];
}

export interface EventRequest {
  type: string;
  source: string;
  payload: Record<string, unknown>;
}

export interface SimulatedEvent extends EventRequest {
  id: string;
  createdAt: string;
  status: "SUCCESS" | "FAILED";
  path: string[];
  durationMs: number;
}

export function defaultTopology(): EventTopology {
  return {
    nodes: [
      { id: "api", name: "API Gateway", provider: "AWS", kind: "api-gateway", status: "IDLE", x: 80, y: 220 },
      { id: "lambda", name: "Lambda", provider: "AWS", kind: "lambda", status: "IDLE", x: 300, y: 220 },
      { id: "sqs", name: "SQS", provider: "AWS", kind: "sqs", status: "IDLE", x: 520, y: 220 },
      { id: "bus", name: "Service Bus", provider: "AZURE", kind: "service-bus", status: "IDLE", x: 750, y: 220 },
      { id: "function", name: "Azure Function", provider: "AZURE", kind: "azure-function", status: "IDLE", x: 980, y: 220 },
      { id: "consumer", name: "Consumer", provider: "AZURE", kind: "consumer", status: "IDLE", x: 1200, y: 220 }
    ],
    edges: [
      { from: "api", to: "lambda" },
      { from: "lambda", to: "sqs" },
      { from: "sqs", to: "bus" },
      { from: "bus", to: "function" },
      { from: "function", to: "consumer" }
    ]
  };
}

export class EventEngine {
  private current: EventTopology;
  private history: SimulatedEvent[] = [];

  constructor(topology: EventTopology) {
    this.current = topology;
  }

  topology() { return this.current; }
  events() { return this.history; }

  metrics() {
    const success = this.history.filter(e => e.status === "SUCCESS").length;
    return {
      totalEvents: this.history.length,
      successfulEvents: success,
      failedEvents: this.history.length - success,
      successRate: this.history.length ? Math.round((success / this.history.length) * 100) : 100,
      averageLatencyMs: this.history.length
        ? Math.round(this.history.reduce((a, e) => a + e.durationMs, 0) / this.history.length)
        : 0
    };
  }

  async simulate(request: EventRequest): Promise<SimulatedEvent> {
    const start = Date.now();
    const path = this.current.nodes.map(n => n.id);
    for (const node of this.current.nodes) {
      node.status = "PROCESSING";
      await new Promise(r => setTimeout(r, 60));
      node.status = "SUCCESS";
    }

    const result: SimulatedEvent = {
      ...request,
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
      status: "SUCCESS",
      path,
      durationMs: Date.now() - start
    };
    this.history.unshift(result);
    return result;
  }

  reset() {
    this.current = defaultTopology();
    this.history = [];
  }
}
