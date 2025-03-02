# Script to initialize DOGA processor with custom settings

# Get custom settings from command line arguments or use defaults
param(
    [string]$dogaApiUrl = "https://doga-parser-415554190254.us-central1.run.app",
    [string]$dogaApiKey = ""
)

Write-Host "Initializing DOGA processor with custom settings..." -ForegroundColor Cyan

# Define the API URL
$apiUrl = "http://localhost:3001/api/debug/initialize-doga"

# Define the initialization data
$initData = @{
    apiUrl = $dogaApiUrl
    apiKey = $dogaApiKey
} | ConvertTo-Json

Write-Host "Sending request to $apiUrl with settings:" -ForegroundColor Yellow
Write-Host "DOGA API URL: $dogaApiUrl"
Write-Host "DOGA API Key: " -NoNewline
if ($dogaApiKey) {
    Write-Host "Provided (length: $($dogaApiKey.Length))" -ForegroundColor Green
} else {
    Write-Host "Not provided" -ForegroundColor Yellow
}

# Send the request
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $initData -ContentType "application/json"
    
    Write-Host "Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success -eq $true) {
        Write-Host "Initialization successful!" -ForegroundColor Green
        Write-Host "Connection status: $($response.processor.connectionStatus)"
    } else {
        Write-Host "Initialization failed!" -ForegroundColor Red
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