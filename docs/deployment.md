# Deployment

## Local

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Terraform

Validate each provider independently:

```bash
cd infrastructure/aws && terraform init && terraform validate
cd ../azure && terraform init && terraform validate
```

Do not commit state files, credentials or tfvars containing secrets.
