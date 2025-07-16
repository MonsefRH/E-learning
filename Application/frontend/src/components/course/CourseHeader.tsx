
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, BookOpen } from "lucide-react";

interface Course {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  totalSlides: number;
  level: string;
}

interface CourseHeaderProps {
  course: Course;
  courseProgress: number;
}

const CourseHeader = ({ course, courseProgress }: CourseHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{course.title}</CardTitle>
            <CardDescription className="text-base">{course.description}</CardDescription>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalSlides} slides</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">{course.level}</Badge>
            <div className="text-sm text-muted-foreground">
              Progress: {courseProgress}%
            </div>
            <Progress value={courseProgress} className="w-32 mt-1" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CourseHeader;
