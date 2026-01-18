#!/bin/bash
# Startup script for Render deployment

# Render provides PORT as an environment variable
# Default to 8000 if not set
PORT=${PORT:-8000}

echo "Starting Resumyx API on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
