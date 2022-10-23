import { adminUserUuid } from '../utils/constants.util';
import { UserModel } from '../modules/user.model';

export async function createUser(uuid: string) {
  return UserModel.create({ uuid });
}

export async function findUserByUuid(uuid: string) {
  return UserModel.findOne({ uuid });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

interface UpdateUserByIdParams {
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  sender?: string;
  receiver?: string;
}

export async function updateUserById(input: UpdateUserByIdParams) {
  const { amount, type, receiver, sender } = input;
  if (type === 'credit') {
    await UserModel.updateOne({ _id: receiver }, { $inc: { balance: amount } });
  } else if (type === 'debit') {
    await UserModel.updateOne({ _id: sender }, { $inc: { balance: -amount } });
  } else {
    await UserModel.updateOne({ _id: sender }, { $inc: { balance: -amount } });
    await UserModel.updateOne({ _id: receiver }, { $inc: { balance: amount } });
  }
}

export async function updateAdminBalance(
  amount: number,
  type: 'credit' | 'debit'
) {
  if (type === 'credit') {
    return UserModel.updateOne(
      { uuid: adminUserUuid },
      { $inc: { balance: -amount } }
    );
  } else {
    return UserModel.updateOne(
      { uuid: adminUserUuid },
      { $inc: { balance: amount } }
    );
  }
}
