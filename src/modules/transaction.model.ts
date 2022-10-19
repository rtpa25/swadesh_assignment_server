import mongoose from 'mongoose';
import { UserDocument } from './user.model';

export interface TransactionDocument extends mongoose.Document {
  amount: number;
  user: UserDocument['_id'];
  status: 'pending' | 'success' | 'cancelled' | 'created';
  type: 'debit' | 'credit';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model<TransactionDocument>(
  'Transaction',
  transactionSchema
);
