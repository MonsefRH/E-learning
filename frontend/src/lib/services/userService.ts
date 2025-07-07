import axios, { AxiosError } from 'axios';
            import API_URL from '@/lib/api';
import api from "@/lib/api";

            interface IUserService {
              changePassword(currentPassword: string, newPassword: string): Promise<boolean>;
              updateUserInfo(username?: string, email?: string): Promise<boolean>;
            }

            class UserService implements IUserService {
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
                            `/users/update`,
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







            }

            const userService = new UserService();
            export default userService;