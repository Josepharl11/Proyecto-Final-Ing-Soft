from fastapi import APIRouter, Response, Request
from app.auth.controller import login_user, logout_user

router = APIRouter(prefix="/auth", tags=["Auth"])

# TEMP login for demonstration purposes
@router.post("/login")
def login(response: Response):
    fake_user_id = 1
    return login_user(fake_user_id, response)


@router.post("/logout")
def logout(request: Request, response: Response):
    return logout_user(request, response)
