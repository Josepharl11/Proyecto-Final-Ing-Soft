from fastapi import Response, Request
from .security import create_session, destroy_session

def login_user(user_id: int, response: Response):
    token = create_session(user_id)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,   # ❗ Set True in production with HTTPS
        samesite="Strict",
    )

    return {"message": "Inicio de sesión exitoso"}


def logout_user(request: Request, response: Response):
    token = request.cookies.get("session_token")
    destroy_session(token)
    response.delete_cookie("session_token")
    return {"message": "Sesión cerrada correctamente"}
