import express from 'express';
import { userTransactionController } from '../controllers/userTransaction';

const router = express.Router();

router.post('/create/transaction', userTransactionController.transaction);
router.get('/transactions/:id', userTransactionController.transactionByUser);
router.get('/transaction', userTransactionController.getTransactionReport);

export default router;