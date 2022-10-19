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

export async function updateUserById(
  id: string,
  amount: number,
  type: 'credit' | 'debit'
) {
  if (type === 'credit') {
    return UserModel.updateOne({ _id: id }, { $inc: { balance: amount } });
  } else {
    return UserModel.updateOne({ _id: id }, { $inc: { balance: -amount } });
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
