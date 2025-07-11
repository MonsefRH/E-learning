// src/lib/services/authService.ts
import api from '../api';
import {User} from "@/hooks/useAuth.tsx";



export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  token_type: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  role: "manager" | "trainer" | "learner";
}

export const authService = {


  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    // For login with OAuth2PasswordRequestForm, we need to send form data
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Store the token in localStorage for future authenticated requests
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
  },



  logout: (): void => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

};