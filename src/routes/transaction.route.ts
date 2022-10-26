import { Router } from 'express';
import {
  createCreditTransactionHandler,
  createDebitTransactionHandler,
  createTransferTransactionHandler,
  deleteTransactionHandler,
  getAllTransactionByUserIdHandler,
} from '../controllers/transaction.controller';

const router = Router();

router.post('/credit', createCreditTransactionHandler);
router.post('/debit', createDebitTransactionHandler);
router.post('/transfer', createTransferTransactionHandler);

router.get('/', getAllTransactionByUserIdHandler);
router.delete('/', deleteTransactionHandler);

export default router;
