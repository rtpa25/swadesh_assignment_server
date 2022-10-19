import { Router } from 'express';
import {
  createUserHandler,
  getUserByUuidHandler,
} from '../controllers/user.controller';

const router = Router();

router.post('/', createUserHandler);
router.get('/', getUserByUuidHandler);

export default router;
