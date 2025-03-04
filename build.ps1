# Frontend Build Script for PowerShell
Write-Host "Starting frontend build process..." -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host "Building frontend application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    
    # Ask if the user wants to preview the build
    $preview = Read-Host "Do you want to preview the built application? (y/n)"
    
    if ($preview -eq "y" -or $preview -eq "Y") {
        Write-Host "Starting preview server at http://localhost:4173/ ..." -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop the preview server." -ForegroundColor Yellow
        npm run preview
    } else {
        Write-Host "Preview skipped. The built files are available in the 'dist' directory." -ForegroundColor Cyan
    }
} else {
    Write-Host "Build failed! Please check the errors above." -ForegroundColor Red
}

Write-Host "Build process completed." -ForegroundColor Cyan 