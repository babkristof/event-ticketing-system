import bcrypt from 'bcrypt';
import config from '../config/config';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(Number(config.saltRounds));
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string):Promise<boolean> => {
    return bcrypt.compare(password, hash);
};