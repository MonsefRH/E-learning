import axios from "axios";
import { User, Category, Course, Lesson } from "@/models";

const API_BASE_URL = "http://localhost:8000";

const apiService = {


  // Set token for all requests
  setToken: (token: string) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },



  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch categories");
    }
  },
  createCategory: async (category: { name: string; description: string; parent_id?: number }): Promise<Category> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/categories/`, category);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create category");
    }
  },
  updateCategory: async (id: number, category: { name?: string; description?: string; parent_id?: number }): Promise<Category> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/categories/${id}`, category);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update category");
    }
  },
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/categories/${id}`);
    } catch (error) {
      throw new Error("Failed to delete category");
    }
  },

  // Courses
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/courses/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch courses");
    }
  },
  createCourse: async (course: {
    title: string;
    description: string;
    category_id: number;
    teacher_id?: number;
    deadline?: string;
    is_active: boolean;
  }): Promise<Course> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/courses/`, course);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create course");
    }
  },
  updateCourse: async (
    id: number,
    course: {
      title?: string;
      description?: string;
      category_id?: number;
      teacher_id?: number;
      deadline?: string;
      is_active?: boolean;
    }
  ): Promise<Course> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/courses/${id}`, course);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update course");
    }
  },
  deleteCourse: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/courses/${id}`);
    } catch (error) {
      throw new Error("Failed to delete course");
    }
  },

  // Lessons
  getLessons: async (): Promise<Lesson[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/lessons/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch lessons");
    }
  },
  createLesson: async (lesson: { title: string; description: string; course_id: number }): Promise<Lesson> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/lessons/`, lesson);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create lesson");
    }
  },
  updateLesson: async (id: number, lesson: { title?: string; description?: string; course_id?: number }): Promise<Lesson> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/lessons/${id}`, lesson);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update lesson");
    }
  },
  deleteLesson: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/lessons/${id}`);
    } catch (error) {
      throw new Error("Failed to delete lesson");
    }
  },
};

export default apiService;