import { DocumentDefinition } from 'mongoose';
import {
  TransactionDocument,
  TransactionModel,
} from '../models/transaction.model';

export async function createTransaction(
  input: DocumentDefinition<
    Omit<TransactionDocument, 'createdAt' | 'updatedAt'>
  >
) {
  return TransactionModel.create(input);
}

export async function findTransactionById(id: string) {
  return TransactionModel.findById(id);
}

export async function updateTransactionById(id: string, newStatus: 'success') {
  return TransactionModel.findByIdAndUpdate(id, { status: newStatus });
}

export async function findTransactionsByUserId(userId: string) {
  return TransactionModel.find({ user: userId }).sort({
    createdAt: 'descending',
  });
}

export async function deleteTransaction(id: string) {
  return TransactionModel.findByIdAndDelete(id);
}
