# Debug Tools for NIFYA

This document provides information about the debugging tools available in the NIFYA application, including both web-based diagnostic interfaces and command-line scripts.

## 🌐 Web-Based Debug Interface

The NIFYA frontend includes a built-in debug interface accessible via the `/debug` route.

### Accessing Web Debug Tools

1. Start the application in development mode:
   ```bash
   npm run dev
   # or for hybrid mode with production services:
   npm run hybrid
   ```

2. Navigate to the debug page in your browser:
   ```
   http://localhost:5173/debug
   ```

3. You may need to authenticate first if you're not already logged in.

### Available Web Debug Features

The debug page provides several tabs with different diagnostic capabilities:

#### 1. Subscription API Testing

This tab allows you to test the Subscription API connectivity:

- Test GET requests to fetch subscriptions
- Test GET requests to fetch subscription statistics
- Test POST requests to create test subscriptions
- View detailed request/response information
- Inspect response headers and status codes

#### 2. Data Comparison

This tab compares different data hooks:

- **Standard Hook**: Basic subscription data hook
- **Enhanced Hook**: Advanced hook with fallback capability
- View subscription data from both hooks
- Compare loading states and error handling

#### 3. System Information

This tab provides information about the runtime environment:

- Environment variables (API URLs, environment mode)
- Browser information
- Runtime configuration
- Network status
- Debug actions (refetch data, clear local storage)

## 📜 Command-Line Debug Scripts

The project includes several PowerShell scripts to help debug and test specific functionality.

### Prerequisites for Scripts

- The subscription-worker service must be running on port 3001
- PowerShell must be installed

### Available Scripts

#### 1. Initialize DOGA Processor

The `initialize-doga.ps1` script allows you to initialize the DOGA processor with custom settings.

```powershell
# Usage with default settings
.\initialize-doga.ps1

# Usage with custom API URL
.\initialize-doga.ps1 -dogaApiUrl "https://custom-doga-parser-url.com"

# Usage with custom API URL and key
.\initialize-doga.ps1 -dogaApiUrl "https://custom-doga-parser-url.com" -dogaApiKey "your-api-key"
```

#### 2. Test DOGA Processor

The `test-doga.ps1` script allows you to test the DOGA processor with a sample subscription.

```powershell
# Usage
.\test-doga.ps1
```

#### 3. Check Subscription Logs

The `check-subscription-logs.ps1` script allows you to check the logs for a specific subscription.

```powershell
# Usage (subscription ID is required)
.\check-subscription-logs.ps1 -subscriptionId "your-subscription-id"
```

#### 4. Fix Notifications

The `fix-notifications.ps1` script helps diagnose and fix notification delivery issues.

```powershell
# Usage
.\fix-notifications.ps1
```

## 🔍 Hybrid Development Mode

The `hybrid-dev.sh` script creates a development environment that uses:
- Local frontend code
- Production backend services
- Enhanced debugging capabilities

```bash
# Start hybrid development
./hybrid-dev.sh

# For WSL environments
./hybrid-dev-wsl.sh
```

The hybrid mode automatically configures:
- A proxy to route API requests to production services
- Environment variables for debugging
- Enhanced logging and error reporting

## 🔍 Diagnosing Common Issues

### API Connection Issues

If you're experiencing API connection issues:

1. Use the Subscription API tab to test direct connectivity
2. Check the response headers for CORS or authentication issues
3. Verify that the authorization token is being sent correctly
4. Check if the backend services are available and responding

### Data Loading Problems

If data isn't loading correctly:

1. Use the Data Comparison tab to see if either hook is working
2. Check if there are any errors in the loading process
3. Verify that the enhanced hook is using fallback data when appropriate

### Environment Configuration

If you suspect environment configuration issues:

1. Check the System Information tab for environment variables
2. Verify that the correct URLs are configured for each service
3. Make sure the environment mode (development/production) is set correctly

## 🔒 Security Notes

The debug tools are restricted to development mode or when `VITE_ALLOW_DEBUG=true` is set. In production environments, access to these tools is blocked by default.

**Important:** Be cautious about exposing debug tools in any publicly accessible environment, as they can reveal sensitive information about your application architecture and data.