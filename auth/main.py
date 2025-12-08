from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS = {
    "demo@demo.com": {
        "password": "demo123",
        "nombre": "Usuario Demo",
    }
}

class RegisterSchema(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    access_token: str
    nombre: str

# Esto es para forgot password 
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str



@app.post("/auth/register")
def register(user: RegisterSchema):
    if user.email in USERS:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    USERS[user.email] = {
        "nombre": user.nombre,
        "password": user.password
    }

    return {"message": "Usuario registrado con éxito"}

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


#Nuevo
@app.post("/auth/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(data: ForgotPasswordRequest):
 
    if data.email in USERS:
        print(f"Enlace de recuperación para: {data.email}")
        print(f"   Token simulado: reset-token-{data.email}")
    else:
        print(f"⚠️ Intento de recuperación para email no registrado: {data.email}")
    
    return ForgotPasswordResponse(
        message="Si el correo está registrado, recibirás un enlace de recuperación"
    )