import { Request, Response } from 'express';
import { LoginData, SignUpData } from '../schemas/auth.schema';
import { loginService, signupService } from '../services/auth.service';
import { LoginResponse } from '../types/auth';

export const signup = async (req: Request<never, never, SignUpData>, res: Response) => {
  await signupService(req.body);
  res.status(201).json({ message: 'User registered successfully' });
};

export const login = async (req: Request<never, never, LoginData>, res: Response) => {
  const result: LoginResponse = await loginService(req.body);
  res.json(result);
};
