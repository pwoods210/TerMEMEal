from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.discovery import DiscoveredToken
from app.services.discovery import dismiss_token, get_recent_discoveries


router = APIRouter(
    prefix="/api/discoveries",
    tags=["discoveries"],
)


@router.get(
    "",
    response_model=list[DiscoveredToken],
    response_model_by_alias=True,
)
def get_discoveries(
    session: Session = Depends(get_db),
) -> list[DiscoveredToken]:
    return get_recent_discoveries(session)


@router.post(
    "/{discovery_id}/dismiss",
    status_code=status.HTTP_204_NO_CONTENT,
)
def dismiss_discovery_endpoint(
    discovery_id: int,
    session: Session = Depends(get_db),
) -> None:
    discovery = dismiss_token(session, discovery_id)

    if discovery is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discovery not found",
        )
