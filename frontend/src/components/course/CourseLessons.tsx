
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
}

interface CourseLessonsProps {
  lessons: Lesson[];
}

const CourseLessons = ({ lessons }: CourseLessonsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Course Lessons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((lesson, index) => (
          <div 
            key={lesson.id}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
              lesson.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                lesson.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {lesson.completed ? '✓' : index + 1}
              </div>
              <div>
                <p className="text-sm font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">{lesson.duration}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CourseLessons;
