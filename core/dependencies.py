from fastapi import Depends
from app.auth.security import get_current_user

def require_user(user_id: int = Depends(get_current_user)):
    return user_id
