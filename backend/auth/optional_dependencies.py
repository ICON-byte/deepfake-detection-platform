from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.handler import verify_access_token
from auth.database import get_user_by_username
from jose import JWTError

security = HTTPBearer(auto_error=False)  # don't raise on missing token

def get_optional_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        return None
    token = credentials.credentials
    try:
        payload = verify_access_token(token)
        username = payload.get("sub")
        if username is None:
            return None
        user = get_user_by_username(username)
        return user
    except JWTError:
        return None