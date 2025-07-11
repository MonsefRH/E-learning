interface User {
  id: number; // Changed from string to number
  name: string;
  email: string;
  role: "manager" | "trainer" | "learner";
  created_at: string;
}

interface Lesson {
  id: number; // Changed from string to number
  title: string;
  description: string;
  course_id: number; // Changed from string to number
}

interface Course {
  id: number; // Changed from string to number
  title: string;
  description: string;
  teacher_id?: number; // Changed from string to number
  category_id: number; // Changed from string to number
  is_active: boolean;
  deadline?: string;
  lessons: Lesson[];
}

interface Category {
  id: number; // Changed from string to number
  name: string;
  description: string;
  created_at: string;
  parent_id?: number; // Changed from string to number
  subcategories: Category[];
  courses: Course[];
}

export type { User, Category, Course, Lesson };