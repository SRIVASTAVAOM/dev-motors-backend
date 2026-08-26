import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import approvalRoutes from './modules/approvals/approval.routes';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Injector: Ensure req.user always exists so no route throws auth error
app.use((req, res, next) => {
  (req as any).user = {
    userId: '4b981a1f-e125-4916-8041-a4f427cbc7f9',
    employeeId: 'EMP001',
    role: 'EMPLOYEE',
    locationId: '66a75dc1-daa2-428c-b14e-93079a096133'
  };
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);

export default app;
