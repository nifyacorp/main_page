# Script to check subscription logs
param(
    [Parameter(Mandatory=$true)]
    [string]$subscriptionId
)

Write-Host "Checking logs for subscription: $subscriptionId" -ForegroundColor Cyan

# Define the API URL
$apiUrl = "http://localhost:3001/api/debug/subscription-logs/$subscriptionId"

Write-Host "Sending request to $apiUrl" -ForegroundColor Yellow

# Send the request
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get
    
    Write-Host "Response received:" -ForegroundColor Green
    
    if ($response.success -eq $true) {
        Write-Host "Subscription details:" -ForegroundColor Cyan
        $response.subscription | ConvertTo-Json
        
        Write-Host "`nProcessing history ($($response.processingHistoryCount) entries):" -ForegroundColor Cyan
        $response.processingHistory | ForEach-Object {
            Write-Host "- $($_.processed_at): Status: $($_.status)" -ForegroundColor Yellow
            Write-Host "  Result: $($_.result_summary)" -ForegroundColor Gray
        }
        
        Write-Host "`nNotifications ($($response.notificationsCount) entries):" -ForegroundColor Cyan
        $response.notifications | ForEach-Object {
            Write-Host "- $($_.created_at): $($_.title)" -ForegroundColor Yellow
            Write-Host "  $($_.content.Substring(0, [Math]::Min(100, $_.content.Length)))..." -ForegroundColor Gray
        }
        
        Write-Host "`nLog retrieval successful!" -ForegroundColor Green
    } else {
        Write-Host "Log retrieval failed!" -ForegroundColor Red
        Write-Host $response.error
    }
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Red
        Write-Host $responseBody
    }
} 