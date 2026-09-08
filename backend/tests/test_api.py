from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.discoveries import get_db
from app.main import app
import app.api.discoveries as discoveries_api


def test_get_discoveries_returns_camel_case_api_contract(monkeypatch):
    discovery = SimpleNamespace(
        id=1,
        name="Example Token",
        symbol="EXAMPLE",
        token_address="token-123",
        pair_address="pair-123",
        source="DexScreener",
        exchange="pumpswap",
        discovered_at=datetime(2026, 8, 31, tzinfo=timezone.utc),
        status="new",
        graduated_at=None,
        token_profile={
            "chainId": "solana",
            "tokenAddress": "token-123",
            "icon": "https://example.com/icon.png",
        },
        pairs_data=[
            {
                "chainId": "solana",
                "dexId": "pumpswap",
                "pairAddress": "pair-123",
                "priceUsd": "1.25",
                "liquidity": {"usd": 1000},
            }
        ],
    )

    monkeypatch.setattr(
        discoveries_api,
        "get_recent_discoveries",
        lambda session: [discovery],
    )
    app.dependency_overrides[get_db] = lambda: object()

    try:
        response = TestClient(app).get("/api/discoveries")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "name": "Example Token",
            "symbol": "EXAMPLE",
            "tokenAddress": "token-123",
            "pairAddress": "pair-123",
            "source": "DexScreener",
            "exchange": "pumpswap",
            "discoveredAt": "2026-08-31T00:00:00Z",
            "status": "new",
            "graduatedAt": None,
            "tokenProfile": {
                "chainId": "solana",
                "tokenAddress": "token-123",
                "icon": "https://example.com/icon.png",
            },
            "pairs": [
                {
                    "chainId": "solana",
                    "dexId": "pumpswap",
                    "pairAddress": "pair-123",
                    "priceUsd": "1.25",
                    "liquidity": {"usd": 1000},
                }
            ],
        }
    ]


def test_dismiss_discovery_returns_no_content(monkeypatch):
    monkeypatch.setattr(
        discoveries_api,
        "dismiss_token",
        lambda session, discovery_id: object()
        if discovery_id == 1
        else None,
    )
    app.dependency_overrides[get_db] = lambda: object()

    try:
        response = TestClient(app).post(
            "/api/discoveries/1/dismiss"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 204
    assert response.content == b""


def test_dismiss_discovery_returns_not_found_for_unknown_id(monkeypatch):
    monkeypatch.setattr(
        discoveries_api,
        "dismiss_token",
        lambda session, discovery_id: None,
    )
    app.dependency_overrides[get_db] = lambda: object()

    try:
        response = TestClient(app).post(
            "/api/discoveries/999/dismiss"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json() == {"detail": "Discovery not found"}
