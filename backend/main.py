from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from passlib.context import CryptContext

app = FastAPI()

# ---------------------- CORS PARA PERMITIR EL HTML ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Puedes poner tu dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- Simulación de BASE DE DATOS ---------------------
fake_db = {
    "usuario1@example.com": {
        "password": "$2b$12$EwbGc..."  # encriptada
    }
}

# ---------------------- Seguridad ----------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "CLAVE_SECRETA_AQUI"
serializer = URLSafeTimedSerializer(SECRET_KEY)


# ---------------------- Modelos -----------------------
class EmailRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str


# ---------------------- 1. Solicitud de recuperación ----------------------
@app.post("/auth/forgot-password")
def forgot_password(data: EmailRequest):
    email = data.email

    # Validación: ¿el correo existe?
    if email not in fake_db:
        raise HTTPException(status_code=404, detail="No existe una cuenta con ese correo.")

    # Crear token de 30 min
    token = serializer.dumps(email, salt="password-reset")
    reset_link = f"http://localhost:8000/auth/reset-password?token={token}"

    # Aquí normalmente se envía por email → Por ahora solo lo mostramos en consola
    print("🔗 ENLACE DE RECUPERACIÓN:")
    print(reset_link)

    return {"message": "Enlace enviado correctamente"}


# ---------------------- 2. Validar token (cuando el usuario abre el link) ----------------------
@app.get("/auth/reset-password")
def validate_reset_link(token: str):

    try:
        email = serializer.loads(token, salt="password-reset", max_age=1800)  # 30 min
        return {"message": "Token válido", "email": email}

    except SignatureExpired:
        raise HTTPException(status_code=400, detail="El enlace expiró.")

    except BadSignature:
        raise HTTPException(status_code=400, detail="Token inválido.")


# ---------------------- 3. Cambiar la contraseña ----------------------
@app.post("/auth/reset-password")
def reset_password(data: PasswordReset):
    token = data.token
    new_password = data.new_password

    # Validar token
    try:
        email = serializer.loads(token, salt="password-reset", max_age=1800)
    except:
        raise HTTPException(status_code=400, detail="Token inválido o expirado.")

    # Validar contraseña fuerte
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña es muy débil (mínimo 6 caracteres).")

    # Encriptar contraseña
    hashed = pwd_context.hash(new_password)

    # Guardar en la DB
    fake_db[email]["password"] = hashed

    return {"message": "Contraseña restablecida correctamente."}
