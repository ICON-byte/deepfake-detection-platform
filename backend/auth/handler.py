from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from config import settings

def create_access_token(data: dict) -> str:
    """
    Create a new JWT access token.
    
    Args:
        data: Dictionary containing claims to encode (e.g., {"sub": username})
    
    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_access_token(token: str) -> dict:
    """
    Verify and decode a JWT access token.
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload as dictionary
    
    Raises:
        JWTError: If token is invalid, expired, or signature verification fails
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])