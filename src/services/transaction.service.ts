import { DocumentDefinition } from 'mongoose';
import { SortBy, FilterBy } from '../types/transactionFilter.types';
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

export async function findTransactionsByUserId(
  userId: string,
  sort?: SortBy,
  filter?: FilterBy
) {
  if (sort && filter) {
    switch (sort) {
      case SortBy.amountHtoL:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        })
          .where({
            type:
              filter === FilterBy.All
                ? { $in: ['credit', 'debit', 'transfer'] }
                : filter,
          })
          .sort({
            amount: 'desc',
          });

      case SortBy.amountLtoH:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        })
          .where({
            type:
              filter === FilterBy.All
                ? { $in: ['credit', 'debit', 'transfer'] }
                : filter,
          })
          .sort({
            amount: 'asc',
          });
      case SortBy.dateLtoH:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        })
          .where({
            type:
              filter === FilterBy.All
                ? { $in: ['credit', 'debit', 'transfer'] }
                : filter,
          })
          .sort({
            createdAt: 'asc',
          });
    }
  } else if (sort && !filter) {
    switch (sort) {
      case SortBy.amountHtoL:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        }).sort({
          amount: 'desc',
        });
      case SortBy.amountLtoH:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        }).sort({
          amount: 'asc',
        });
      case SortBy.dateLtoH:
        return TransactionModel.find({
          $or: [{ receiver: userId }, { sender: userId }],
        }).sort({
          createdAt: 'asc',
        });
    }
  } else if (!sort && filter) {
    return TransactionModel.find({
      $or: [{ receiver: userId }, { sender: userId }],
    }).where({
      type:
        filter === FilterBy.All
          ? { $in: ['credit', 'debit', 'transfer'] }
          : filter,
    });
  } else {
    return TransactionModel.find({
      $or: [{ receiver: userId }, { sender: userId }],
    }).sort({
      createdAt: 'desc',
    });
  }
}

export async function deleteTransaction(id: string) {
  return TransactionModel.findByIdAndDelete(id);
}
