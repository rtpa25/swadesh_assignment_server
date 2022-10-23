import { Request, Response } from 'express';
import { UserDocument } from '../modules/user.model';
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
import { oneMinuteInMilliseconds, adminUserId } from '../utils/constants.util';
import { logger } from '../utils/logger.util';

interface CreateTransactionInput {
  amount: number;
  receiver?: UserDocument['_id'];
  sender?: UserDocument['_id'];
  status: 'pending' | 'success' | 'cancelled' | 'created';
  type: 'debit' | 'credit' | 'transfer';
}

export async function createTransactionHandler(
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response
) {
  try {
    const { amount, type, receiver, sender } = req.body;

    if (amount < 0) {
      return res.status(400).send('Amount cannot be negative');
    }

    /*----------  CREDITED AMOUNT > 1000 <CANCELLED>  ----------*/
    if (amount > 1000 && type === 'credit') {
      const transaction = await createTransaction({
        amount,
        status: 'cancelled',
        type,
        receiver,
        sender: adminUserId,
      });
      return res.status(201).send(transaction);
    }

    /*----------  CREDITED AMOUNT < 500 <SUCCESS after a minute> ----------*/
    if (amount <= 500 && type === 'credit') {
      const transaction = await createTransaction({
        amount,
        status: 'pending',
        type,
        receiver,
        sender: adminUserId,
      });

      await updateUserById({ amount, type, receiver }); //increase the user balance
      await updateAdminBalance(amount, type); //decrease the admin balance

      //artificial delay of 1 minute
      setTimeout(async () => {
        transaction.status = 'success';
        await transaction.save();
      }, oneMinuteInMilliseconds);

      return res.status(201).send(transaction);
    }

    /*---------- 1000 > CREDITED AMOUNT > 500 <SUCCESS after 5 minutes> ----------*/
    if (amount <= 1000 && amount > 500 && type === 'credit') {
      const transaction = await createTransaction({
        amount,
        status: 'pending',
        type,
        receiver,
        sender: adminUserId,
      });

      await updateUserById({ amount, type, receiver }); //increase the user balance
      await updateAdminBalance(amount, type); //decrease the admin balance

      //artificial delay of 5 minute
      setTimeout(async () => {
        transaction.status = 'success';
        await transaction.save();
      }, oneMinuteInMilliseconds * 5);

      return res.status(201).send(transaction);
    }

    /*---------- DEBIT ----------*/
    if (type === 'debit') {
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

      await updateUserById({ amount, type, sender }); //increase the user balance
      await updateAdminBalance(amount, type); //increase the admin balance

      return res.status(201).send(transaction);
    }

    if (type === 'transfer') {
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
    } else {
      return res.status(400).send('should never come here');
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function getAllTransactionByUserIdHandler(
  req: Request<{}, {}, {}, { userId: string }>,
  res: Response
) {
  try {
    const { userId } = req.query;
    const transactions = await findTransactionsByUserId(userId);
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
