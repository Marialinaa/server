#!/bin/bash
echo "🚀 Custom Start Script - Finding correct directory..."

# Check if we're in the right place
if [ -f "package.json" ]; then
    echo "✅ Found package.json in current directory"
    npm start
elif [ -f "server/package.json" ]; then
    echo "✅ Found package.json in server directory"
    cd server
    npm start
elif [ -f "dist/index.js" ]; then
    echo "✅ Found dist/index.js directly"
    node dist/index.js
elif [ -f "index.js" ]; then
    echo "✅ Found index.js directly"
    node index.js
else
    echo "❌ Cannot find startup file. Listing current directory:"
    ls -la
    echo "Checking for any JS files:"
    find . -name "*.js" -type f | head -10
    exit 1
fi