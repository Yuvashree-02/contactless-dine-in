import { Router } from 'express';
import { getTables, getTableById, getTableByNumber, createTable, updateTable, deleteTable } from '../controllers/tableController';

const router = Router();

router.get('/', getTables);
router.get('/number/:tableNumber', getTableByNumber);
router.get('/:id', getTableById);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

export default router;