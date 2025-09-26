import { Router } from 'express';
import { validateBody, validateParams } from '../middleware/validation.middleware.ts';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import { createHabit, getUserHabits, updateHabit } from '../controllers/habit.controller.ts';

const createHabitSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    frequency: z.string(),
    targetCount: z.string(),
    tagIds: z.array(z.string()).optional(),
});

const completeParamsSchema = z.object({
    id: z.string(),
});

const router = Router();

router.use(authenticateToken);

router.get('/', getUserHabits);
router.patch('/:id', updateHabit);
router.get('/:id', (req, res) => {
    res.json({ message: 'Got one habit' });
});
router.post('/', validateBody(createHabitSchema), createHabit);
router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Habit completed' });
});
router.delete('/:id', (req, res) => {
    res.json({ message: 'Habit deleted' });
});

export default router;
