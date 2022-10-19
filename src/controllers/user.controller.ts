import { Request, Response } from 'express';
import { createUser, findUserByUuid } from '../services/user.service';
import { logger } from '../utils/logger.util';

export async function createUserHandler(
  req: Request<{}, {}, { uuid: string }>,
  res: Response
) {
  try {
    const user = await createUser(req.body.uuid);
    return res.status(201).send(user);
  } catch (error: any) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export async function getUserByUuidHandler(
  req: Request<{}, {}, {}, { uuid: string }>,
  res: Response
) {
  try {
    const user = await findUserByUuid(req.query.uuid);
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send('User not found');
    }
  } catch (error: any) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}
