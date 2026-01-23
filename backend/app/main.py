from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router
from app.api.auth import router as auth_router
from app.api.ai_settings_routes import router as ai_settings_router
from app.api.advanced_routes import router as advanced_router

# Create FastAPI app
app = FastAPI(
    title="Resumyx API",
    description="AI-powered resume builder backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth_router, prefix="/api")
app.include_router(ai_settings_router, prefix="/api")
app.include_router(advanced_router, prefix="/api")
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Resumyx API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
