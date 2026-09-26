# AWS integration

The reference architecture maps:

- API Gateway → ingress
- Lambda → compute
- SQS → durable queue
- EventBridge → event routing

The repository's default mode does not require AWS credentials. Real SDK clients should use workload identity, IAM least privilege and environment-specific configuration.
