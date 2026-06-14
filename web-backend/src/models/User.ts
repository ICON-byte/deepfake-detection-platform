import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface for the User Document
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 2. Build the Mongoose Schema matching the Interface
const UserSchema: Schema = new Schema(
  {
    fullName: { 
      type: String, 
      required: [true, 'Full name is required'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'] 
    }
  },
  {
    timestamps: true
  }
);

// 3. Export the compiled Mongoose Model
export const User = mongoose.model<IUser>('User', UserSchema);