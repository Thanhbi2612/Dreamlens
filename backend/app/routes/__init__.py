from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.image import router as image_router
from app.routes.dream import router as dream_router

__all__ = ["auth_router", "health_router", "image_router", "dream_router"]
