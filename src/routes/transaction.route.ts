import { Router } from 'express';
import {
  createTransactionHandler,
  getAllTransactionByUserIdHandler,
} from '../controllers/transaction.controller';

const router = Router();

router.post('/', createTransactionHandler);
router.get('/', getAllTransactionByUserIdHandler);

export default router;
