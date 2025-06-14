#!/bin/bash

# Average Calculator Microservice Deployment Script
# Author: Moksh Aithandla (1RN22IS191)

echo "🚀 Average Calculator Microservice Deployment"
echo "=============================================="

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if port 9876 is available
if lsof -Pi :9876 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 9876 is already in use. Stopping existing processes..."
    pkill -f "node.*server"
    sleep 2
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Pure Node.js (No Dependencies) - Recommended"
echo "2. Express Framework (With Dependencies)"
echo "3. Docker Deployment"
echo "4. Run Tests Only"

read -p "Select option (1-4): " option

case $option in
    1)
        echo ""
        echo "🟢 Starting Pure Node.js Server..."
        echo "No dependencies required!"
        node server-pure.js
        ;;
    2)
        echo ""
        echo "🟡 Installing dependencies..."
        npm install
        echo "🟢 Starting Express Server..."
        npm start
        ;;
    3)
        echo ""
        echo "🐳 Docker Deployment..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed."
            exit 1
        fi
        
        echo "Building Docker image..."
        docker-compose up --build -d
        
        echo "✅ Container started successfully!"
        echo "🌐 Service available at: http://localhost:9876"
        echo "📊 Health check: http://localhost:9876/health"
        
        # Wait for container to be ready
        sleep 5
        
        echo ""
        echo "🧪 Testing container health..."
        curl -s http://localhost:9876/health | jq '.' || echo "Health check failed"
        ;;
    4)
        echo ""
        echo "🧪 Running Test Suite..."
        
        # Start server in background for testing
        node server-pure.js &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 3
        
        # Run tests
        node test-pure.js
        
        # Stop server
        kill $SERVER_PID
        ;;
    *)
        echo "❌ Invalid option selected."
        exit 1
        ;;
esac