# Deploying NIFYA Frontend to Cloud Run

This guide explains how to deploy the NIFYA frontend application to Google Cloud Run for direct testing and production use.

## Benefits of Cloud Run Deployment

1. **Direct Testing Endpoints**: Provides stable URLs for testing different environments
2. **Consistent Infrastructure**: Aligns frontend hosting with backend services
3. **Scalability**: Automatically scales based on traffic
4. **Global CDN**: Integrates with Google's global CDN for fast content delivery
5. **Simplified CI/CD**: Enables continuous deployment through Cloud Build

## Prerequisites

Before deploying, ensure you have:

1. Google Cloud SDK installed and configured
2. Docker installed locally for testing
3. Access to the Google Cloud project
4. Node.js and npm installed

## Deployment Instructions

### Option 1: Automated Deployment

Use the provided script to deploy automatically:

```bash
# Make the script executable if needed
chmod +x deploy-to-cloud-run.sh

# Run the deployment script
./deploy-to-cloud-run.sh
```

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. **Build the frontend assets**:
   ```bash
   npm run build
   ```

2. **Build the Docker image**:
   ```bash
   docker build -t gcr.io/your-project-id/nifya-frontend:latest .
   ```

3. **Push to Container Registry**:
   ```bash
   docker push gcr.io/your-project-id/nifya-frontend:latest
   ```

4. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy nifya-frontend \
     --image gcr.io/your-project-id/nifya-frontend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "AUTH_SERVICE_URL=https://authentication-service-url,BACKEND_SERVICE_URL=https://backend-service-url" \
     --port 8080
   ```

### Option 3: Continuous Deployment with Cloud Build

Set up continuous deployment using Cloud Build:

1. Connect your GitHub repository to Cloud Build
2. Use the provided `cloudbuild.yaml` configuration
3. Set up a trigger to deploy on commits to main/master branch

## Configuration

### Environment Variables

The deployment uses these environment variables:

- `AUTH_SERVICE_URL`: URL of the authentication service
- `BACKEND_SERVICE_URL`: URL of the main backend service

### NGINX Configuration

The `nginx.conf` file handles:

- Routing for single-page application
- API proxying to backend services
- Cache control for static assets
- Gzip compression for better performance

## Testing the Deployment

After deployment, test the application:

1. **Access the application** at the Cloud Run URL provided after deployment
2. **Test authentication flow** by logging in with test credentials
3. **Create a subscription** to verify integration with backend services
4. **Check for proper API routing** by monitoring network requests

## Troubleshooting

If you encounter issues:

1. **Check Cloud Run logs** for application errors
2. **Verify environment variables** are set correctly
3. **Test Docker image locally** before deployment:
   ```bash
   docker run -p 8080:8080 gcr.io/your-project-id/nifya-frontend:latest
   ```
4. **Check CORS configuration** if API requests fail

## Security Considerations

- Cloud Run services are public by default with `--allow-unauthenticated`
- Consider adding authentication for staging environments
- Ensure proper CORS headers are configured
- Review Cloud IAM permissions regularly