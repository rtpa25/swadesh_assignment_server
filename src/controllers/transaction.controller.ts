import { Request, Response } from 'express';
import { FilterBy, SortBy } from 'src/types/transactionFilter.types';
import { UserDocument } from '../models/user.model';
import {
  createTransaction,
  deleteTransaction,
  findTransactionsByUserId,
} from '../services/transaction.service';
import {
  findUserById,
  updateAdminBalance,
  updateUserById,
} from '../services/user.service';
import {
  adminUserId,
  timeIntervalForCreditTransactions,
} from '../utils/constants.util';
import { logger } from '../utils/logger.util';

interface CreateTransactionInput {
  amount: number;
  receiver?: UserDocument['_id'];
  sender?: UserDocument['_id'];
  status: 'pending' | 'success' | 'cancelled' | 'created';
  type: 'debit' | 'credit' | 'transfer';
}

export async function createDebitTransactionHandler(
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response
) {
  try {
    const { amount, type, sender } = req.body;

    if (amount < 0) {
      return res.status(400).send('Amount cannot be negative');
    }

    if (!sender) return;

    const currentUser = await findUserById(sender);
    if (currentUser) {
      //case where the user wants to debit more than his current balance <CANCELLED>
      if (currentUser?.balance < amount) {
        return res.status(400).send('Insufficient balance');
      }
    }

    const transaction = await createTransaction({
      amount,
      status: 'success',
      type,
      sender,
      receiver: adminUserId,
    });

    await updateUserById({ amount, type: 'debit', sender }); //decrease the user balance
    await updateAdminBalance(amount, 'debit'); //increase the admin balance

    return res.status(201).send(transaction);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function createCreditTransactionHandler(
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response
) {
  try {
    const { amount, type, receiver } = req.body;

    if (amount < 0) {
      return res.status(400).send('Amount cannot be negative');
    }

    /*----------  CREDITED AMOUNT > 1000 <CANCELLED>  ----------*/
    if (amount > 1000) {
      const transaction = await createTransaction({
        amount,
        status: 'cancelled',
        type,
        receiver,
        sender: adminUserId,
      });
      return res.status(201).send(transaction);
    }

    const transaction = await createTransaction({
      amount,
      status: 'pending',
      type,
      receiver,
      sender: adminUserId,
    });

    await updateUserById({ amount, type: 'credit', receiver }); //increase the user balance
    await updateAdminBalance(amount, 'credit'); //decrease the admin balance

    //artificial delay of 1 minute
    setTimeout(async () => {
      try {
        transaction.status = 'success';
        await transaction.save();
      } catch (error) {
        logger.error(error);
        transaction.status = 'failed';
        await transaction.save();
      }
      //after this point the txn is successful
      timeIntervalForCreditTransactions(amount);
    });

    return res.status(201).send(transaction); //user fetched is pending
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function createTransferTransactionHandler(
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response
) {
  try {
    const { amount, type, receiver, sender } = req.body;

    if (amount < 0) {
      return res.status(400).send('Amount cannot be negative');
    }

    const currentUser = await findUserById(sender);
    if (currentUser) {
      //case where the user wants to transfer more than his current balance <CANCELLED>
      if (currentUser?.balance < amount) {
        return res.status(400).send('Insufficient balance');
      }
    }

    const transaction = await createTransaction({
      amount,
      status: 'success',
      type,
      sender,
      receiver,
    });

    await updateUserById({ amount, type, receiver, sender }); //update both user balances

    return res.status(201).send(transaction);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function getAllTransactionByUserIdHandler(
  req: Request<
    {},
    {},
    {},
    { userId: string; sort?: SortBy; filter?: FilterBy }
  >,
  res: Response
) {
  try {
    const { userId, sort, filter } = req.query;
    const transactions = await findTransactionsByUserId(userId, sort, filter);
    return res.status(200).send(transactions);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function deleteTransactionHandler(
  req: Request<{}, {}, { id: string }>,
  res: Response
) {
  try {
    const { id } = req.body;
    const transaction = await deleteTransaction(id);
    return res.status(200).send(transaction);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}
