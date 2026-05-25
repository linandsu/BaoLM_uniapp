import { request } from './config';

export interface LoginResult {
  token: string;
  role: 'client' | 'merchant';
  userId: string;
  username: string;
  profile?: any;
}

export async function loginApi(username: string, password: string): Promise<LoginResult> {
  return request({ url: '/auth/login', method: 'POST', data: { username, password } });
}

export async function registerApi(data: {
  username: string;
  password: string;
  role: 'client' | 'merchant';
}): Promise<void> {
  return request({ url: '/auth/register', method: 'POST', data });
}
