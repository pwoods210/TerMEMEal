from datetime import datetime, timezone

from sqlalchemy import case, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.database.models import Discovery


def get_active_discoveries(
    session: Session,
    limit: int = 50,
) -> list[Discovery]:
    statement = (
        select(Discovery)
        .where(Discovery.dismissed_at.is_(None))
        .order_by(Discovery.discovered_at.desc())
        .limit(limit)
    )

    return list(session.scalars(statement))


def dismiss_discovery(
    session: Session,
    discovery_id: int,
) -> Discovery | None:
    discovery = session.get(Discovery, discovery_id)

    if discovery is None:
        return None

    if discovery.dismissed_at is None:
        discovery.dismissed_at = datetime.now(timezone.utc)
        session.commit()

    return discovery


def upsert_discovery(
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
    token_profile = token_profile or {}
    pairs = pairs or []

    statement = insert(Discovery).values(
        token_address=token_address,
        pair_address=pair_address,
        name=name,
        symbol=symbol,
        source=source,
        exchange=exchange,
        status=status,
        graduated_at=graduated_at,
        token_profile=token_profile,
        pairs_data=pairs,
    )

    update_values = {
        "pair_address": statement.excluded.pair_address,
        "name": statement.excluded.name,
        "symbol": statement.excluded.symbol,
        "source": statement.excluded.source,
        "exchange": statement.excluded.exchange,
        "token_profile": statement.excluded.token_profile,
        "pairs_data": statement.excluded.pairs_data,

        # Never downgrade a token after it has graduated.
        "status": case(
            (
                Discovery.status == "graduated",
                Discovery.status,
            ),
            else_=statement.excluded.status,
        ),
    }

    if status == "graduated":
        update_values["graduated_at"] = (
            statement.excluded.graduated_at
        )

    statement = statement.on_conflict_do_update(
        index_elements=[Discovery.token_address],
        set_=update_values,
    )

    session.execute(statement)
    session.commit()

    discovery = session.scalar(
        select(Discovery).where(
            Discovery.token_address == token_address
        )
    )

    if discovery is None:
        raise RuntimeError(
            f"Failed to persist discovery {token_address}"
        )

    return discovery
