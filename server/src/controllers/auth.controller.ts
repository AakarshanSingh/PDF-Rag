import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { config } from '../config/env.js';
import { sendVerificationEmail } from '../services/email.service.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Name, email, password and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser[0]) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, config.jwtSecret, { expiresIn: '1h' });

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError: any) {
      // If email fails, delete the user so they can try again
      await db.delete(users).where(eq(users.email, email));
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ 
        message: `Failed to send verification email: ${emailError.message || 'Unknown error'}. Please check your Resend configuration.` 
      });
    }

    res.status(201).json({ message: 'User created. Please check your email to verify.' });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, uploadLimit: user.uploadLimit } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const [user] = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    await db.update(users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(users.id, user.id));

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
