import { Router } from 'express';
import { register, login, verifyEmail } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/verify', verifyEmail);
