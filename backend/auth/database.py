from pymongo import MongoClient
from datetime import datetime
from config import settings
from bson import ObjectId

client = MongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]
users_collection = db["users"]

# Ensure unique indexes
users_collection.create_index("username", unique=True)
users_collection.create_index("email", unique=True)

def get_user_by_username(username: str):
    return users_collection.find_one({"username": username})

def get_user_by_email(email: str):
    return users_collection.find_one({"email": email})

def get_user_by_id(user_id: str):
    from bson import ObjectId
    return users_collection.find_one({"_id": ObjectId(user_id)})

def create_user(username: str, email: str, hashed_password: str):
    user = {
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "quota_used": 0,
        "is_active": True
    }
    result = users_collection.insert_one(user)
    user["_id"] = str(result.inserted_id)
    return user