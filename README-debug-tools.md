# Debug Tools for NIFYA

This directory contains several PowerShell scripts to help debug and test the NIFYA application, particularly the subscription processing functionality.

## Prerequisites

- The subscription-worker service must be running on port 3001
- PowerShell must be installed

## Available Scripts

### 1. Initialize DOGA Processor

The `initialize-doga.ps1` script allows you to initialize the DOGA processor with custom settings.

```powershell
# Usage with default settings
.\initialize-doga.ps1

# Usage with custom API URL
.\initialize-doga.ps1 -dogaApiUrl "https://custom-doga-parser-url.com"

# Usage with custom API URL and key
.\initialize-doga.ps1 -dogaApiUrl "https://custom-doga-parser-url.com" -dogaApiKey "your-api-key"
```

### 2. Test DOGA Processor

The `test-doga.ps1` script allows you to test the DOGA processor with a sample subscription.

```powershell
# Usage
.\test-doga.ps1
```

### 3. Check Subscription Logs

The `check-subscription-logs.ps1` script allows you to check the logs for a specific subscription.

```powershell
# Usage (subscription ID is required)
.\check-subscription-logs.ps1 -subscriptionId "your-subscription-id"
```

## Troubleshooting

If you encounter any issues with these scripts, please check the following:

1. Make sure the subscription-worker service is running on port 3001
2. Check that the API endpoints are correctly implemented in the subscription-worker service
3. Verify that you have the necessary permissions to access the API endpoints

## API Endpoints

These scripts use the following API endpoints:

- `POST /api/debug/initialize-doga`: Initialize the DOGA processor with custom settings
- `POST /api/debug/test-doga`: Test the DOGA processor with a sample subscription
- `GET /api/debug/subscription-logs/:id`: Get logs for a specific subscription

For more information about these endpoints, please refer to the subscription-worker documentation. 