from fastapi import APIRouter

from ..schemas import LoginRequest, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: SignupRequest):
    return {
        "ok": True,
        "user": {"name": payload.name, "email": payload.email},
        "token": "demo-token"
    }


@router.post("/login")
def login(payload: LoginRequest):
    return {
        "ok": True,
        "user": {"email": payload.email},
        "token": "demo-token"
    }
