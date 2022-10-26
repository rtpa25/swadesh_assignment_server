import mongoose from 'mongoose';
import { UserDocument } from './user.model';

export interface TransactionDocument extends mongoose.Document {
  amount: number;
  sender: UserDocument['_id'];
  receiver: UserDocument['_id'];
  status: 'pending' | 'success' | 'cancelled' | 'created' | 'failed';
  type: 'debit' | 'credit' | 'transfer';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
