# auth/routes.py
from fastapi import APIRouter, HTTPException, status, Depends, Form
from models.user import UserCreate, Token
from auth.password import hash_password, verify_password
from auth.database import get_user_by_username, get_user_by_email, create_user
from auth.handler import create_access_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# ---------- Register ----------
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    if get_user_by_username(user.username):
        raise HTTPException(400, "Username already taken")
    if get_user_by_email(user.email):
        raise HTTPException(400, "Email already registered")
    
    hashed_pw = hash_password(user.password)
    new_user = create_user(user.username, user.email, hashed_pw)
    return {"message": "User created successfully", "user_id": str(new_user["_id"])}

# ---------- Login (OAuth2 compatible using Form) ----------
@router.post("/token", response_model=Token)
def login(
    username: str = Form(...),
    password: str = Form(...),
):
    """
    OAuth2 compatible token login.
    Expects form fields: username, password
    """
    # Try to find user by username first, then by email
    db_user = get_user_by_username(username)
    if not db_user:
        # fallback: treat username as email
        db_user = get_user_by_email(username)
    
    if not db_user:
        raise HTTPException(401, detail="Invalid credentials")
    
    if not verify_password(password, db_user["hashed_password"]):
        raise HTTPException(401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# ---------- Get current user ----------
@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "quota_used": current_user.get("quota_used", 0)
    }