from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import create_access_token
from pydantic import BaseModel
import httpx
import os

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleTokenRequest(BaseModel):
    token: str


@router.post("/google")
async def google_auth(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.token}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_data = response.json()

    if google_data.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    email = google_data.get("email")
    name = google_data.get("name", email)
    avatar_url = google_data.get("picture")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, avatar_url=avatar_url)
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url,
        }
    }