#!/bin/bash
echo "🔧 Custom Build Script - Finding correct directory..."

# Check if we're in the right place
if [ -f "package.json" ]; then
    echo "✅ Found package.json in current directory"
    npm install
    npm run build
elif [ -f "server/package.json" ]; then
    echo "✅ Found package.json in server directory"
    cd server
    npm install
    npm run build
else
    echo "❌ Cannot find package.json. Listing current directory:"
    ls -la
    echo "Checking subdirectories:"
    find . -name "package.json" -type f
    exit 1
fi

echo "✅ Build completed successfully!"