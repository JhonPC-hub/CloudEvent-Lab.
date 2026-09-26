export interface AzureEventAdapter {
  provider: "AZURE";
  publish(event: Record<string, unknown>): Promise<{ accepted: boolean; provider: "AZURE" }>;
}

export class AzureSimulationAdapter implements AzureEventAdapter {
  provider = "AZURE" as const;
  async publish(_event: Record<string, unknown>) {
    return { accepted: true, provider: this.provider };
  }
}
