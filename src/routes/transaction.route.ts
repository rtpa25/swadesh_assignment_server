import { Router } from 'express';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  getAllTransactionByUserIdHandler,
} from '../controllers/transaction.controller';

const router = Router();

router.post('/', createTransactionHandler);
router.get('/', getAllTransactionByUserIdHandler);
router.delete('/', deleteTransactionHandler);

export default router;
