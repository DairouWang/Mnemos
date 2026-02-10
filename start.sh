#!/bin/bash
# Mnemos Startup Script

echo "Mnemos - Timeline Memory"
echo "========================"
echo ""
echo "Starting local server..."
echo "Open browser: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server 8080
