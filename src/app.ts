import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import expenseRoutes from './modules/expenses/expense.routes.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Dev Motors API Live' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

export default app;
