import { Request, Response } from 'express';
import { LoginData, SignUpData } from '../schemas/auth.schema';
import {authService} from "../services";
import { LoginResponse } from '../types/auth';

export const signup = async (req: Request<never, never, SignUpData>, res: Response) => {
  await authService.signup(req.body);
  res.status(201).json({ message: 'User registered successfully' });
};

export const login = async (req: Request<never, never, LoginData>, res: Response) => {
  const result: LoginResponse = await authService.login(req.body);
  res.json(result);
};
