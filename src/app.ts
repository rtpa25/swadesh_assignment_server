//@dependencies
import 'dotenv/config';
import express from 'express';

//@utils
import { connectToDB } from './utils/connect.util';
import { logger } from './utils/logger.util';

//@routers
import userRouter from './routes/user.route';
import transactionRouter from './routes/transaction.route';

const app = express();

app.use(express.json());

//@health-check
app.get('/', (_, res) => {
  res.send('Hello from server');
});

//@routes
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);

app.listen(8080, async () => {
  await connectToDB();
  logger.info('Server is running on http://localhost:8080');
});
