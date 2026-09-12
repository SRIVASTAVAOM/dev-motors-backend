import { Router } from 'express';
import { 
  createExpense, 
  addExpense, 
  updateExpense,
  getExpenses, 
  getMyExpenses, 
  getCategories, 
  processApproval, 
  deleteExpense,
  getTimeline 
} from './expense.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, createExpense);
router.post('/add', authenticate, addExpense);
router.patch('/:id', authenticate, updateExpense);
router.put('/:id', authenticate, updateExpense);
router.get('/', authenticate, getExpenses);
router.get('/my', authenticate, getMyExpenses);
router.get('/categories', getCategories);
router.post('/:id/approval', processApproval);
router.put('/:id/approval', processApproval);
router.delete('/:id', deleteExpense);
router.get('/:id/timeline', getTimeline);

export default router;
