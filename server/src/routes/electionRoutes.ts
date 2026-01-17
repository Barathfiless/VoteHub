
import express from 'express';
import { getElections, createElection, updateElection, deleteElection } from '../controllers/electionController.js';

const router = express.Router();

router.get('/', getElections);
router.post('/', createElection);
router.put('/:id', updateElection);
router.delete('/:id', deleteElection);

export default router;
