import dotenv from 'dotenv';

dotenv.config();

type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CHAPA_SECRET_KEY: string;
  CHAPA_PUBLIC_KEY?: string;
  CHAPA_ENCRYPTION_KEY?: string;
  CHAPA_BASE_URL: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  CLIENT_URL: string;
  SERVER_URL: string;
};

const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'CHAPA_SECRET_KEY'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env: AppEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY as string,
  CHAPA_PUBLIC_KEY: process.env.CHAPA_PUBLIC_KEY,
  CHAPA_ENCRYPTION_KEY: process.env.CHAPA_ENCRYPTION_KEY,
  CHAPA_BASE_URL: process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:5000',
};

export default env;
