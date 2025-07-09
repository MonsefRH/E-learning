import axios, { AxiosError } from 'axios';
import api from "@/lib/api";

interface IUserService {
  changePassword(currentPassword: string, newPassword: string): Promise<boolean>;
  updateUserInfo(username?: string, email?: string): Promise<boolean>;
  getAllUsers(): Promise<any[]>;
  updateUser(id: number ,username?: string, email?: string,level?: string): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    role: string;
    level ?: string;
}

class UserService implements IUserService {

    async createUser(registerinput : RegisterInput): Promise<boolean> {
        try {
            const response = await api.post(
                `/users/create`,
                registerinput
            );


            return response.status >= 200 && response.status < 300;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to create user:', axiosError.response?.data || axiosError.message);
            return false; // Return false instead of throwing to handle errors gracefully
        }
    }

    async getAllUsers(): Promise<any[]> {
        try {
            const response = await api.get('/users/get-all');
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to fetch users:', axiosError.response?.data || axiosError.message);
            return [];
        }
    }


    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        if(currentPassword && newPassword) {
        try {

            const response = await api.put(
                `/users/change-password`,
                {
                    current_password: currentPassword,
                    new_password: newPassword
                }
            );

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }

            return response.status >= 200 && response.status < 300;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to change password:',
                axiosError.response?.data || axiosError.message);
            return false; // Return false instead of throwing to handle errors gracefully
        }
        }
    }

    async updateUserInfo(username?: string, email?: string): Promise<boolean> {
        try {


            const response = await api.put(
                `/users/update-account`,
                {
                    username,
                    email
                }
            );

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }

            return response.status >= 200 && response.status < 300;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to update user info:',
                axiosError.response?.data || axiosError.message);
            return false; // Return false instead of throwing to handle errors gracefully
        }
    }

    async updateUser(id: number ,username?: string, email?: string,level?: string): Promise<boolean> {
        try {


            const response = await api.put(
                `/users/update`,
                {
                    id,
                    username,
                    email,
                    level
                }
            );



            return response.status >= 200 && response.status < 300;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to update user info:',
                axiosError.response?.data || axiosError.message);
            return false; // Return false instead of throwing to handle errors gracefully
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            const response = await api.delete(`/users/delete/${id}`);

            return response.status >= 200 && response.status < 300;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to delete user:', axiosError.response?.data || axiosError.message);
            return false;
        }
    }









}

const userService = new UserService();
export default userService;