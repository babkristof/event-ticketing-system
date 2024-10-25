import { Request, Response } from 'express';
import { LoginSchema, SignUpSchema } from '../schemas/auth.schema';
import { loginService, signupService } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  const validatedData = SignUpSchema.parse(req.body);
  await signupService(validatedData);
  res.status(201).json({ message: 'User registered successfully' });
};

export const login = async (req: Request, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);
  const result = await loginService(validatedData);
  res.json(result);
};
