from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr

app = FastAPI()


USERS = {
    "demo@demo.com": {
        "password": "demo123",
        "nombre": "Usuario Demo",
    }
}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    message: str
    access_token: str
    nombre: str


@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user_data = USERS.get(data.email)

    if not user_data or user_data["password"] != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",  
        )

    
    fake_token = f"fake-token-{data.email}"

    return LoginResponse(
        message="Inicio de sesión exitoso",
        access_token=fake_token,
        nombre=user_data["nombre"],
    )
