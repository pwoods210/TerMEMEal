import os
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database.connection import Base
from app.database.models import Discovery
from app.database.repository import (
    dismiss_discovery,
    get_active_discoveries,
    upsert_discovery,
)


@pytest.fixture
def db_session():
    database_url = os.environ.get("TEST_DATABASE_URL")

    if not database_url:
        pytest.skip("TEST_DATABASE_URL is required for repository integration tests")

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        try:
            yield session
        finally:
            session.rollback()

            for table in reversed(Base.metadata.sorted_tables):
                session.execute(table.delete())

            session.commit()

    engine.dispose()


def discovery_values(token_address: str, *, status: str = "new") -> dict:
    return {
        "token_address": token_address,
        "pair_address": f"pair-{token_address}",
        "name": f"Token {token_address}",
        "symbol": token_address.upper(),
        "source": "test",
        "exchange": "pumpswap",
        "status": status,
    }


@pytest.mark.integration
def test_upsert_updates_existing_token_instead_of_inserting_duplicate(
    db_session,
):
    profile = {
        "chainId": "solana",
        "tokenAddress": "abc",
        "icon": "https://example.com/icon.png",
    }
    pairs = [{"dexId": "pumpswap", "priceUsd": "1.25"}]

    first = upsert_discovery(
        db_session,
        **discovery_values("abc", status="watching"),
        token_profile=profile,
        pairs=pairs,
    )
    updated_profile = {**profile, "description": "Updated"}
    updated_pairs = [{"dexId": "pumpswap", "priceUsd": "2.50"}]
    second = upsert_discovery(
        db_session,
        **{
            **discovery_values("abc", status="new"),
            "pair_address": "pair-updated",
            "name": "Updated Token",
        },
        token_profile=updated_profile,
        pairs=updated_pairs,
    )

    stored = db_session.get(Discovery, first.id)

    assert second.id == first.id
    assert stored is not None
    assert stored.pair_address == "pair-updated"
    assert stored.name == "Updated Token"
    assert stored.status == "new"
    assert stored.token_profile == updated_profile
    assert stored.pairs_data == updated_pairs


@pytest.mark.integration
def test_upsert_never_downgrades_a_graduated_token(db_session):
    graduated_at = datetime.now(timezone.utc)

    upsert_discovery(
        db_session,
        **discovery_values("abc", status="graduated"),
        graduated_at=graduated_at,
    )
    upsert_discovery(
        db_session,
        **discovery_values("abc", status="watching"),
    )

    stored = db_session.scalar(
        select(Discovery).where(
            Discovery.token_address == "abc"
        )
    )

    assert stored is not None
    assert stored.status == "graduated"
    assert stored.graduated_at is not None


@pytest.mark.integration
def test_dismiss_discovery_sets_timestamp_and_is_idempotent(db_session):
    discovery = upsert_discovery(
        db_session,
        **discovery_values("abc"),
    )

    dismissed = dismiss_discovery(db_session, discovery.id)
    dismissed_again = dismiss_discovery(db_session, discovery.id)

    assert dismissed is not None
    assert dismissed.dismissed_at is not None
    assert dismissed_again is not None
    assert dismissed_again.dismissed_at == dismissed.dismissed_at


@pytest.mark.integration
def test_get_active_discoveries_excludes_dismissed_and_applies_order_and_limit(
    db_session,
):
    now = datetime.now(timezone.utc)
    db_session.add_all(
        [
            Discovery(
                **discovery_values("old"),
                discovered_at=now - timedelta(minutes=2),
            ),
            Discovery(
                **discovery_values("new"),
                discovered_at=now,
            ),
            Discovery(
                **discovery_values("dismissed"),
                discovered_at=now + timedelta(minutes=1),
                dismissed_at=now,
            ),
        ]
    )
    db_session.commit()

    discoveries = get_active_discoveries(db_session, limit=1)

    assert [discovery.token_address for discovery in discoveries] == ["new"]
