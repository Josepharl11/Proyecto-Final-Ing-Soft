from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from passlib.context import CryptContext
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="tucorreo@gmail.com",
    MAIL_PASSWORD="tu_clave_de_app",
    MAIL_FROM="tucorreo@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "CLAVE_SECRETA_AQUI"
serializer = URLSafeTimedSerializer(SECRET_KEY)

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

class PasswordReset(BaseModel):
    token: str
    new_password: str

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

# ---------------------- 1. Forgot password ----------------------
@app.post("/auth/forgot-password", response_model=ForgotPasswordResponse) 
def forgot_password(data: ForgotPasswordRequest): 
    email = data.email 
    if email in USERS: 
        token = serializer.dumps(email, salt="password-reset") 
        reset_link = f"http://localhost:8000/auth/reset-password?token={token}" 
        print("🔗 ENLACE DE RECUPERACIÓN:") 
        print(reset_link) 
    else: 
        print(f"⚠️ Intento de recuperación para email no registrado: {email}") 
        return ForgotPasswordResponse( 
        message="Si el correo está registrado, recibirás un enlace de recuperación" 
)

# ---------------------- 2. Validar token ----------------------
@app.get("/auth/reset-password")
def validate_reset_link(token: str):
    try:
        email = serializer.loads(token, salt="password-reset", max_age=1800)
        return {"message": "Token válido", "email": email}

    except SignatureExpired:
        raise HTTPException(status_code=400, detail="El enlace expiró.")

    except BadSignature:
        raise HTTPException(status_code=400, detail="Token inválido.")

# ---------------------- 3. Cambiar contraseña ----------------------
@app.post("/auth/reset-password")
def reset_password(data: PasswordReset):
    token = data.token
    new_password = data.new_password

    try:
        email = serializer.loads(token, salt="password-reset", max_age=1800)
    except:
        raise HTTPException(status_code=400, detail="Token inválido o expirado.")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña es muy débil (mínimo 6 caracteres).")

    hashed = pwd_context.hash(new_password)

    USERS[email]["password"] = hashed

    return {"message": "Contraseña restablecida correctamente."}