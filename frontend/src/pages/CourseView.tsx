import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AudioCapture } from "@/components/audio/AudioCapture";
import AvatarPresentation from "@/components/presentation/AvatarPresentation";
import CourseExercises from "@/components/course/CourseExercises";
import CourseHeader from "@/components/course/CourseHeader";
import CourseStats from "@/components/course/CourseStats";
import CourseLessons from "@/components/course/CourseLessons";
import CourseResources from "@/components/course/CourseResources";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [courseProgress, setCourseProgress] = useState(45);

  // Mock course data
  const course = {
    id: courseId,
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning with hands-on examples",
    instructor: "Dr. Sarah Wilson",
    duration: "2 hours",
    totalSlides: 25,
    category: "Technology",
    level: "Beginner",
    students: 1234,
    rating: 4.8,
    lessons: [
      { id: 1, title: "What is Machine Learning?", duration: "10 min", completed: true },
      { id: 2, title: "Types of ML Algorithms", duration: "15 min", completed: true },
      { id: 3, title: "Supervised Learning", duration: "20 min", completed: false },
      { id: 4, title: "Unsupervised Learning", duration: "18 min", completed: false },
    ],
  };

  // Mock slides data for AvatarPresentation
  const slides = [
    {
      id: 1,
      title: "What is Machine Learning?",
      content: "Machine Learning is a subset of Artificial Intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
      duration: 60,
      avatarScript: "Welcome to our course on Machine Learning! Today we'll explore what machine learning is and how it's revolutionizing technology.",
    },
    // ... other slides
  ];

  const handleCourseComplete = () => {
    setCourseProgress(100);
    toast({
      title: "Course completed!",
      description: "Congratulations on completing the course!",
    });
  };

  const breadcrumbs = [
    { label: "Courses", href: "/courses" },
    { label: course.title },
  ];

  return (
    <DashboardLayout title={course.title} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <CourseHeader course={course} courseProgress={courseProgress} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="presentation" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="presentation">Presentation</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="presentation">
                <AvatarPresentation
                  courseId={courseId || "1"}
                  courseTitle={course.title}
                  slides={slides}
                  onComplete={handleCourseComplete}
                />
              </TabsContent>

              <TabsContent value="exercises">
                <CourseExercises courseId={courseId || "1"} />
              </TabsContent>

              <TabsContent value="resources">
                <CourseResources />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {user?.role === "learner" && <AudioCapture />}
            <CourseLessons lessons={course.lessons} />
            <CourseStats courseProgress={courseProgress} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseView;