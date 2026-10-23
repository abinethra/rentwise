import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes import agreements

# Configure logging format for standard development output
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("rentwise.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler that creates database tables on startup."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="RentWise Backend API",
    description="Backend service for analyzing tenant rental agreements with Gemini AI.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local frontend clients (Vite default 5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(agreements.router)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "healthy",
        "service": "RentWise Backend",
        "stage": 1,
        "features": ["sqlite_models", "pdf_pypdf_extraction", "photo_gemini_vision_ocr"],
    }
