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

type RegisteredUser = PublicUser & {
  phone_number: string;
  status: string;
  created_at: string;
};

type ServiceError = Error & { statusCode?: number };

export const register = async ({ full_name, email, phone_number, password, role = 'donor' }: RegisterInput) => {
  // Security Constraint: Users cannot register themselves as administrators.
  // Administrative accounts are created by direct DB promotion or administrative seed actions only.
  if (role === 'admin') {
    const error: ServiceError = new Error('Cannot self-register as admin');
    error.statusCode = 400;
    throw error;
  }

  // Duplicate Check: Prevent multiple accounts from sharing the same email address.
  const exists = await pool.query<{ user_id: string }>('SELECT user_id FROM users WHERE email = $1', [email]);
  if ((exists.rowCount || 0) > 0) {
    const error: ServiceError = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  // Password Hashing: Hash password using bcryptjs with 12 salt rounds.
  // 12 rounds provides a strong balance between cryptographic safety and execution time.
  const password_hash = await bcrypt.hash(password, 12);
  const result = await pool.query<DbUser>(
    `INSERT INTO users (full_name, email, phone_number, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, phone_number, role, status, created_at`,
     [full_name, email, phone_number, password_hash, role]
  );

  const user = result.rows[0];
  
  // Session generation: Sign a new JWT containing roles and database identifiers.
  const token = jwt.sign(
    { userId: user.user_id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  );

  const publicUser: RegisteredUser = {
    id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };

  return { token, user: publicUser };
};

export const login = async ({ email, password }: LoginInput): Promise<{ token: string; user: PublicUser }> => {
  // Fetch user by email.
  const result = await pool.query<DbUser>(
    'SELECT user_id, full_name, email, phone_number, password_hash, role, status, created_at FROM users WHERE email = $1',
    [email]
  );
  
  // Security Best Practice: Use a generic error message ('Invalid credentials')
  // for both user not found and wrong passwords. This prevents user enumeration
  // vulnerability where attackers probe for valid email registration lists.
  if ((result.rowCount || 0) === 0) {
    const error: ServiceError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];
  
  // Verify password match using timing-attack resistant comparison
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error: ServiceError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Account Status Check: Block suspended organizers/donors from logging into the platform
  if (user.status === 'suspended') {
    const error: ServiceError = new Error('Account suspended. Contact support.');
    error.statusCode = 403;
    throw error;
  }

  // Generate session JWT token
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
