import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Token payload shape expected from the server's JWTs.
type TokenPayload = {
  userId: string;
  role: string;
  email: string;
};

// Express middleware that verifies a Bearer JWT and attaches a `user` object
// to `req` on success. Returns 401 when no token provided and 403 when the
// token is invalid or expired. Keep the middleware side-effect minimal so
// downstream handlers can rely on `req.user` being present.
export const verifyToken = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token.' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
