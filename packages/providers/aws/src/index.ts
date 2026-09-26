export interface AwsEventAdapter {
  provider: "AWS";
  publish(event: Record<string, unknown>): Promise<{ accepted: boolean; provider: "AWS" }>;
}

export class AwsSimulationAdapter implements AwsEventAdapter {
  provider = "AWS" as const;
  async publish(_event: Record<string, unknown>) {
    return { accepted: true, provider: this.provider };
  }
}
