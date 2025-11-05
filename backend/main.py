from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
import models
from database import create_tables, close_db, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI app"""
    # Startup
    print(" Starting MuseMap backend...")
    print(" Creating database tables...")
    await create_tables()
    print("Database tables created successfully!")

    yield

    # Shutdown
    print("🔌 Closing database connections...")
    await close_db()
    print(" MuseMap backend shut down")


app = FastAPI(
    title="MuseMap API",
    description="Backend API for MuseMap music streaming platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MuseMap backend is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint with database connection test"""
    try:
        # Test database connection
        await db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


# Thêm các API endpoints của bạn vào đây
#
# Ví dụ:
# @app.get("/api/items")
# async def get_items(db: AsyncSession = Depends(get_db)):
#     """Get all items"""
#     from sqlalchemy import select
#
#     result = await db.execute(select(models.YourModel))
#     items = result.scalars().all()
#     return {"items": items}