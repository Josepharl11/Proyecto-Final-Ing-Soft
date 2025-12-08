from fastapi import FastAPI, HTTPException
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

USERS = {}

class RegisterSchema(BaseModel):
    nombre: str
    email: EmailStr
    password: str

@app.post("/auth/register")
def register(user: RegisterSchema):
    if user.email in USERS:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    USERS[user.email] = {
        "nombre": user.nombre,
        "password": user.password
    }

    return {"message": "Usuario registrado con éxito"}