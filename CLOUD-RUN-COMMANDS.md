# Cloud Run Deployment Commands Reference

## Project Information

- **Project ID**: 415554190254
- **Region**: us-central1
- **Service Name**: main-page

## Common Cloud Run Commands

### View Running Services

```bash
gcloud run services list
```

### Get Service URL

```bash
gcloud run services describe main-page --region us-central1 --format="value(status.url)"
```

### Deploy New Revision

```bash
gcloud run deploy main-page \
  --image gcr.io/415554190254/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app
```

### Update Environment Variables

```bash
gcloud run services update main-page \
  --region us-central1 \
  --set-env-vars AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app
```

### View Revisions

```bash
gcloud run revisions list --service main-page --region us-central1
```

### View Revision Details

```bash
gcloud run revisions describe REVISION_NAME --region us-central1
```

### View Service Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=main-page" --limit 50
```

### View Specific Revision Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=main-page AND resource.labels.revision_name=REVISION_NAME" --limit 50
```

### View Deployment Error Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=main-page AND severity>=ERROR" --limit 20
```

## Build Commands

### Build with Cloud Build

```bash
gcloud builds submit --tag gcr.io/415554190254/frontend:latest
```

### Build with Specific Config

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### List Container Images

```bash
gcloud container images list-tags gcr.io/415554190254/frontend
```

## Troubleshooting

### Check Service Availability

```bash
curl -I https://main-page-415554190254.us-central1.run.app
```

### Check Container Configuration

```bash
# Get container info
gcloud run services describe main-page --region us-central1

# Check environment variables
gcloud run services describe main-page --region us-central1 --format="yaml(spec.template.spec.containers[0].env)"
```

### Force New Deployment

```bash
gcloud run deploy main-page \
  --image gcr.io/415554190254/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AUTH_SERVICE_URL=https://authentication-service-415554190254.us-central1.run.app,BACKEND_SERVICE_URL=https://backend-415554190254.us-central1.run.app \
  --no-traffic \
  --tag=test
```

Then test the new revision before migrating traffic:

```bash
# Test the revision
curl https://test---main-page-415554190254.us-central1.run.app

# If working correctly, migrate traffic
gcloud run services update-traffic main-page --region us-central1 --to-latest
```