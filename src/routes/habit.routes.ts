import { Router } from 'express';
import { validateBody, validateParams } from '../middleware/validation.middleware.ts';
import { z } from 'zod';

const createHabitSchema = z.object({
    name: z.string(),
});

const completeParamsSchema = z.object({
    id: z.string(),
});

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Habits' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Got one habit' });
});

router.post('/', validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Habit created' });
});

router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Habit completed' });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'Habit deleted' });
});

export default router;
