from datetime import datetime, timedelta
from fastapi import HTTPException, Request

SESSION_TIMEOUT_MINUTES = 15

# Stores all active sessions here
ACTIVE_SESSIONS = {}   # token → { user_id, last_activity }


def create_session(user_id: int) -> str:
    token = f"session-{user_id}-{datetime.now().timestamp()}"
    ACTIVE_SESSIONS[token] = {
        "user_id": user_id,
        "created_at": datetime.now(),
        "last_activity": datetime.now(),
    }
    return token


def destroy_session(token: str):
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]


def get_current_user(request: Request):
    token = request.cookies.get("session_token")

    if not token or token not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = ACTIVE_SESSIONS[token]
    now = datetime.now()

    # Session timeout
    if now - session["last_activity"] > timedelta(minutes=SESSION_TIMEOUT_MINUTES):
        destroy_session(token)
        raise HTTPException(status_code=401, detail="Session expired")

    # Refresh last activity
    session["last_activity"] = now
    return session["user_id"]

