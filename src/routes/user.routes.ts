import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
    res.json({ message: 'Users' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Got user' });
});

router.put('/:id', (req, res) => {
    res.json({ message: 'User updated' });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'User deleted' });
});

export default router;
