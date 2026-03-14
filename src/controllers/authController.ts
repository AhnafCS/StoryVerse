import { api } from '../lib/api';
import { User, AuthResponse } from '../models/User';

export class AuthController {
  static async login(credentials: { email: string; password: string }) {
    const response = await api.auth.login(credentials);
    return response;
  }

  static async register(userData: { email: string; password: string; name: string }) {
    const response = await api.auth.register(userData);
    return response;
  }

  static saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  static getAuthData(): { token: string | null; user: User | null } {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  }

  static clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    const { token } = this.getAuthData();
    return !!token;
  }
}
