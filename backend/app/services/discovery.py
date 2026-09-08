from datetime import datetime

from sqlalchemy.orm import Session

from app.database.models import Discovery
from app.database.repository import (
    dismiss_discovery,
    get_active_discoveries,
    upsert_discovery,
)


def get_recent_discoveries(
    session: Session,
) -> list[Discovery]:
    return get_active_discoveries(
        session,
        limit=50,
    )


def dismiss_token(
    session: Session,
    discovery_id: int,
) -> Discovery | None:
    return dismiss_discovery(session, discovery_id)


def record_discovery(
    session: Session,
    *,
    token_address: str,
    pair_address: str | None,
    name: str,
    symbol: str,
    source: str,
    exchange: str | None,
    status: str,
    graduated_at: datetime | None = None,
    token_profile: dict | None = None,
    pairs: list[dict] | None = None,
) -> Discovery:
    return upsert_discovery(
        session,
        token_address=token_address,
        pair_address=pair_address,
        name=name,
        symbol=symbol,
        source=source,
        exchange=exchange,
        status=status,
        graduated_at=graduated_at,
        token_profile=token_profile,
        pairs=pairs,
    )
