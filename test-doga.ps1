# Test script for DOGA processor
Write-Host "Testing DOGA processor..." -ForegroundColor Cyan

# Define the API URL
$apiUrl = "http://localhost:3001/api/debug/test-doga"

# Define the test data
$testData = @{
    config = @{
        keywords = @("test", "prueba", "información")
        sections = @("all")
    }
} | ConvertTo-Json

Write-Host "Sending request to $apiUrl with data:" -ForegroundColor Yellow
Write-Host $testData

# Send the request
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $testData -ContentType "application/json"
    
    Write-Host "Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success -eq $true) {
        Write-Host "Test successful!" -ForegroundColor Green
    } else {
        Write-Host "Test failed!" -ForegroundColor Red
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