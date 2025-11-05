from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager

from app.database import create_tables, close_db
from app.routes import health, auth, image, dream
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI app"""
    # Startup
    print("Starting MuseMap backend...")
    print("Creating database tables...")
    await create_tables()
    print("Database tables created successfully!")

    yield

    # Shutdown
    print("Closing database connections...")
    await close_db()
    print("MuseMap backend shut down")


app = FastAPI(
    title="MuseMap API",
    description="Backend API for MuseMap music streaming platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add SessionMiddleware for OAuth (required by authlib)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="musemap_session",
    max_age=1800,  # 30 minutes
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(auth.callback_router)  # Google OAuth callback
app.include_router(image.router)  # Image generation
app.include_router(dream.router)  # Dream sessions (sidebar history)
