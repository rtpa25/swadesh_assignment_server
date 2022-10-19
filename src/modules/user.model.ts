import mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  uuid: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
