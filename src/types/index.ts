export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginInput {
  email: string;
  password: string;
}