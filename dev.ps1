# Frontend Development Server Script for PowerShell
Write-Host "Starting frontend development environment..." -ForegroundColor Cyan

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
npm install

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "The server will be available at http://localhost:5173/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

npm run dev 