from fastapi import APIRouter
from sqlalchemy import text

from app.database.connection import engine
from app.services.health import discovery_is_alive, record_discovery_heartbeat

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/api")
def get_health() -> bool:
    return True


@router.post("/discovery/heartbeat")
def discovery_heartbeat():
    record_discovery_heartbeat()

    return {"ok": True}


def database_is_alive() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


@router.get("/services")
def service_health():
    discovery_up = discovery_is_alive()
    database_up = database_is_alive()

    return {
        "discovery": {
            "status": "up" if discovery_up else "down",
        },
        "trade": {
            "status": "down",
        },
        "database": {
            "status": "up" if database_up else "down",
        },
    }
