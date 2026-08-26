import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import expenseRoutes from './modules/expenses/expense.routes.js';
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Dev Motors API Live' });
});
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
export default app;
