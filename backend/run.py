"""
Startup script for Render deployment.
This is more reliable than bash scripts as it handles PORT environment variable in Python.
"""
import os
import uvicorn

if __name__ == "__main__":
    # Render provides PORT environment variable
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")

    print(f"Starting Resumyx API on {host}:{port}...")

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=1,
        log_level="info"
    )
