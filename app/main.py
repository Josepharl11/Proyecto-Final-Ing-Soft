from fastapi import FastAPI
from app.auth.routes import router as auth_router

app = FastAPI()

# Register auth routes
app.include_router(auth_router)


# Example protected route
from fastapi import Depends
from app.auth.security import get_current_user

@app.get("/dashboard")
def dashboard(user_id: int = Depends(get_current_user)):
    return {"message": "Bienvenido al Dashboard", "user": user_id}
