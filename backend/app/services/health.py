# app/services/service_health.py

from datetime import datetime, timezone

_last_discovery_heartbeat: datetime | None = None


def record_discovery_heartbeat() -> None:
    global _last_discovery_heartbeat
    _last_discovery_heartbeat = datetime.now(timezone.utc)


def discovery_is_alive(timeout_seconds: int = 15) -> bool:
    if _last_discovery_heartbeat is None:
        return False

    now = datetime.now(timezone.utc)
    age = (now - _last_discovery_heartbeat).total_seconds()

    return age < timeout_seconds
