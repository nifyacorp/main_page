# Subscription and Notification Diagnostic Script
# This script helps diagnose issues with subscriptions and notifications

Write-Host "NIFYA Subscription and Notification Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host

# Configuration
$backendUrl = "https://backend-415554190254.us-central1.run.app"
$subscriptionWorkerUrl = "https://subscription-worker-415554190254.us-central1.run.app"
$subscriptionId = "7400b781-1ae8-4a4f-8f1c-1d3a72dde7ba" # Replace with your subscription ID

# Function to check backend status
function Test-Backend {
    Write-Host "Testing Backend Connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET
        Write-Host "Backend is UP! Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Backend is DOWN! Error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check subscription worker
function Test-SubscriptionWorker {
    Write-Host "Testing Subscription Worker Connection..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$subscriptionWorkerUrl/health" -Method GET
        Write-Host "Subscription Worker is UP! Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Subscription Worker is DOWN! Error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check subscription processor debug endpoint
function Check-SubscriptionProcessor {
    param (
        [string]$token,
        [string]$subscriptionId
    )
    
    Write-Host "Checking Subscription Processor for ID: $subscriptionId" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-WebRequest -Uri "$subscriptionWorkerUrl/debug/subscription-logs/$subscriptionId" -Method GET -Headers $headers
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "Subscription processing logs retrieved!" -ForegroundColor Green
        Write-Host "Subscription Info: $($data.subscription.name)" -ForegroundColor Cyan
        Write-Host "Processing History: $($data.processingHistory.Count) records" -ForegroundColor Cyan
        Write-Host "Notifications: $($data.notifications.Count) notifications" -ForegroundColor Cyan
        
        # Display some details about notifications
        if ($data.notifications.Count -gt 0) {
            Write-Host "`nNotification Details:" -ForegroundColor Yellow
            foreach ($notification in $data.notifications) {
                Write-Host "- Title: $($notification.title)" -ForegroundColor White
                Write-Host "  Created: $($notification.created_at)" -ForegroundColor Gray
                Write-Host "  Read: $($notification.read)" -ForegroundColor Gray
                Write-Host ""
            }
        }
        else {
            Write-Host "No notifications found for this subscription!" -ForegroundColor Red
        }
        
        return $data
    }
    catch {
        Write-Host "Error checking subscription processor: $_" -ForegroundColor Red
        return $null
    }
}

# Main diagnostic flow
Write-Host "Starting Diagnostic Tests..." -ForegroundColor Magenta
$backendStatus = Test-Backend
$workerStatus = Test-SubscriptionWorker

if ($backendStatus -and $workerStatus) {
    Write-Host "`nBasic connectivity tests passed. Now checking subscription processing..." -ForegroundColor Green
    Write-Host "Please enter your authentication token to proceed with subscription checks:" -ForegroundColor Yellow
    $token = Read-Host -Prompt "Auth Token"
    
    if ($token) {
        $result = Check-SubscriptionProcessor -token $token -subscriptionId $subscriptionId
        
        if ($result -and $result.processingHistory.Count -gt 0) {
            # Analyze the processing history to find issues
            $latestProcessing = $result.processingHistory[0]
            Write-Host "`nAnalyzing latest processing record from: $($latestProcessing.created_at)" -ForegroundColor Yellow
            
            if ($latestProcessing.status -eq "error") {
                Write-Host "ERROR in processing: $($latestProcessing.response_data.error)" -ForegroundColor Red
                Write-Host "This explains why no notifications were generated." -ForegroundColor Red
            }
            elseif ($latestProcessing.status -eq "completed" -and $result.notifications.Count -eq 0) {
                Write-Host "Processing completed successfully but no notifications were generated." -ForegroundColor Yellow
                Write-Host "This suggests that either:" -ForegroundColor Yellow
                Write-Host "1. The processor didn't find any matching content" -ForegroundColor Yellow
                Write-Host "2. There might be an issue with notification creation" -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "No token provided. Skipping subscription checks." -ForegroundColor Red
    }
}

Write-Host "`nDiagnostic completed. Use this information to troubleshoot the notification issues." -ForegroundColor Magenta
