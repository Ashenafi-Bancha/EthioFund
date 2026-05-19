export type UserRole = 'guest' | 'donor' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  status?: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthRegisterInput extends AuthLoginInput {
  full_name: string;
  phone_number: string;
  role?: Exclude<UserRole, 'guest'>;
}

export interface ApiUser {
  id?: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  status?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}