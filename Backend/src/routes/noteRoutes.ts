import express from 'express';
import {
  createNote,
  getNotes,
  deleteNote,
  updateNote
} from '../controllers/noteController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protect all note routes
router.use(authenticateToken);

// Note routes
router.post('/', createNote);
router.get('/', getNotes);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;