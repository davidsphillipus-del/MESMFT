#!/bin/bash

# MESMTF Healthcare System - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🏥 MESMTF Healthcare System - Production Deployment"
echo "=================================================="

# Configuration
FRONTEND_DIR="."
BACKEND_DIR="./backend"
BUILD_DIR="./dist"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check if .env files exist
    if [ ! -f "$FRONTEND_DIR/.env" ]; then
        warning ".env file not found in frontend directory"
    fi
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        warning ".env file not found in backend directory"
    fi
    
    success "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm ci --production=false
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm ci --production=false
    
    cd ..
    success "Dependencies installed"
}

# Run tests and linting
run_quality_checks() {
    log "Running quality checks..."
    
    # Frontend checks
    cd "$FRONTEND_DIR"
    log "Running frontend type checking..."
    npm run type-check
    
    log "Running frontend linting..."
    npm run lint
    
    # Backend checks
    cd "$BACKEND_DIR"
    log "Running backend checks..."
    npm run lint
    
    cd ..
    success "Quality checks passed"
}

# Database setup
setup_database() {
    log "Setting up database..."
    
    cd "$BACKEND_DIR"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Run database migrations
    log "Running database migrations..."
    npm run migrate
    
    # Create initial backup
    log "Creating initial backup..."
    npm run backup
    
    cd ..
    success "Database setup completed"
}

# Build frontend
build_frontend() {
    log "Building frontend for production..."
    
    cd "$FRONTEND_DIR"
    
    # Clean previous build
    rm -rf "$BUILD_DIR"
    
    # Build for production
    npm run build:prod
    
    # Verify build
    if [ ! -d "$BUILD_DIR" ]; then
        error "Frontend build failed - dist directory not found"
    fi
    
    # Check if index.html exists
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        error "Frontend build failed - index.html not found"
    fi
    
    cd ..
    success "Frontend build completed"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start backend
    log "Starting backend service..."
    cd "$BACKEND_DIR"
    
    # Check if backend is already running
    if pgrep -f "node server.js" > /dev/null; then
        warning "Backend service is already running"
        pkill -f "node server.js"
        sleep 2
    fi
    
    # Start backend in production mode
    nohup npm run prod > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        error "Backend failed to start"
    fi
    
    cd ..
    success "Backend service started (PID: $BACKEND_PID)"
    
    # Frontend is served by the backend in production
    log "Frontend will be served by the backend"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check backend health
    if curl -f http://localhost:5001/health > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check if frontend files are accessible
    if [ -f "$BUILD_DIR/index.html" ]; then
        success "Frontend files are accessible"
    else
        error "Frontend files are not accessible"
    fi
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    # Add any cleanup tasks here
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment process..."
    
    # Create log file
    touch "$LOG_FILE"
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    run_quality_checks
    setup_database
    build_frontend
    start_services
    health_check
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Backend is running on http://localhost:5001"
    log "Frontend is served from the backend"
    log "Health check: http://localhost:5001/health"
    log "API status: http://localhost:5001/api/v1/status"
    
    echo ""
    echo "📋 Deployment Summary:"
    echo "====================="
    echo "✅ Frontend built and ready"
    echo "✅ Backend service running"
    echo "✅ Database migrated and backed up"
    echo "✅ Health checks passed"
    echo ""
    echo "📊 Logs: $LOG_FILE"
    echo "🔗 Application: http://localhost:5001"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
