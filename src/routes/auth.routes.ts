import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.ts';
import { validateBody } from '../middleware/validation.middleware.ts';
import { insertUserSchema } from '../db/schema.ts';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

const router = Router();

router.post('/register', validateBody(insertUserSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
