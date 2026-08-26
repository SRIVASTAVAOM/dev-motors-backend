import { Router } from 'express';
import { 
  createExpense, 
  addExpense, 
  getExpenses, 
  getMyExpenses, 
  getCategories, 
  processApproval, 
  deleteExpense,
  getTimeline 
} from './expense.controller.js';

const router = Router();

router.post('/', createExpense);
router.post('/add', addExpense);
router.get('/', getExpenses);
router.get('/my', getMyExpenses);
router.get('/categories', getCategories);
router.post('/:id/approval', processApproval);
router.put('/:id/approval', processApproval);
router.delete('/:id', deleteExpense);
router.get('/:id/timeline', getTimeline);

export default router;
