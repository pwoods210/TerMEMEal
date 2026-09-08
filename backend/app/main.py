from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.discoveries import router as discoveries_router
from app.api.health import router as health_router
from app.config import get_settings


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    description="Backend API for token discovery and trade operations.",
    version=settings.app_version,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(discoveries_router)
