import { describe, expect, it } from "vitest";
import { EventEngine, defaultTopology } from "@cloud-event-lab/event-core";

describe("EventEngine", () => {
  it("simulates an event through the topology", async () => {
    const engine = new EventEngine(defaultTopology());
    const result = await engine.simulate({
      type: "ORDER_CREATED",
      source: "test",
      payload: { orderId: "ORD-1" }
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.path.length).toBeGreaterThan(2);
    expect(engine.metrics().totalEvents).toBe(1);
  });
});
