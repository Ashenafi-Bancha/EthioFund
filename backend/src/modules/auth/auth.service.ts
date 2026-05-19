import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import pool from '../../config/db';
import env from '../../config/env';

type RegisterInput = {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type DbUser = {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  role: string;
  status: string;
  created_at: string;
};

type PublicUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type ServiceError = Error & { statusCode?: number };

export const register = async ({ full_name, email, phone_number, password, role = 'donor' }: RegisterInput) => {
  if (role === 'admin') {
    const error: ServiceError = new Error('Self-registration as admin is not allowed');
    error.statusCode = 403;
    throw error;
  }

  const exists = await pool.query<{ user_id: string }>('SELECT user_id FROM users WHERE email = $1', [email]);
  if ((exists.rowCount || 0) > 0) {
    const error: ServiceError = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const result = await pool.query<DbUser>(
    `INSERT INTO users (full_name, email, phone_number, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, phone_number, role, status, created_at`,
    [full_name, email, phone_number, password_hash, role]
  );

  return result.rows[0];
};

export const login = async ({ email, password }: LoginInput): Promise<{ token: string; user: PublicUser }> => {
  const result = await pool.query<DbUser>('SELECT * FROM users WHERE email = $1', [email]);
  if ((result.rowCount || 0) === 0) {
    const error: ServiceError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error: ServiceError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'suspended') {
    const error: ServiceError = new Error('Your account has been suspended');
    error.statusCode = 403;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.user_id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

  return {
    token,
    user: {
      id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};
