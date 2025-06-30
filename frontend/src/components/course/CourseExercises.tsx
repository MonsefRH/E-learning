
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, Award, RefreshCw } from "lucide-react";

interface Exercise {
  id: number;
  type: "multiple-choice" | "text" | "practical";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

interface CourseExercisesProps {
  courseId: string;
}

const CourseExercises = ({ courseId }: CourseExercisesProps) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const exercises: Exercise[] = [
    {
      id: 1,
      type: "multiple-choice",
      question: "What is Machine Learning?",
      options: [
        "A type of computer hardware",
        "A subset of AI that enables computers to learn from data",
        "A programming language",
        "A database management system"
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: 2,
      type: "multiple-choice",
      question: "Which of the following is NOT a type of machine learning?",
      options: [
        "Supervised Learning",
        "Unsupervised Learning",
        "Reinforcement Learning",
        "Sequential Learning"
      ],
      correctAnswer: 3,
      points: 10
    },
    {
      id: 3,
      type: "text",
      question: "Explain in your own words how supervised learning differs from unsupervised learning. Provide one example of each.",
      points: 20
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentExercise]: value
    }));
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    exercises.forEach((exercise, index) => {
      if (exercise.type === "multiple-choice" && answers[index] !== undefined) {
        if (parseInt(answers[index]) === exercise.correctAnswer) {
          totalScore += exercise.points;
        }
      } else if (exercise.type === "text" && answers[index]?.trim()) {
        // For text answers, give partial credit if answered
        totalScore += exercise.points * 0.8; // 80% for attempting
      }
    });
    setScore(totalScore);
  };

  const resetExercises = () => {
    setCurrentExercise(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const totalPoints = exercises.reduce((sum, ex) => sum + ex.points, 0);
  const currentExerciseData = exercises[currentExercise];

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Exercise Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {score}/{totalPoints}
              </div>
              <p className="text-muted-foreground">
                Your Score: {Math.round((score / totalPoints) * 100)}%
              </p>
            </div>

            <Progress value={(score / totalPoints) * 100} className="h-4" />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Performance Summary</h3>
              <div className="space-y-2 text-sm">
                {exercises.map((exercise, index) => {
                  const isCorrect = exercise.type === "multiple-choice" 
                    ? parseInt(answers[index] || "") === exercise.correctAnswer
                    : !!answers[index]?.trim();
                  
                  return (
                    <div key={exercise.id} className="flex items-center justify-between">
                      <span>Question {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{isCorrect ? exercise.points : 0}/{exercise.points} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <Button onClick={resetExercises} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Exercises
              </Button>
              <Button>
                Continue to Next Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Course Exercises</CardTitle>
            <Badge variant="outline">
              {currentExercise + 1} of {exercises.length}
            </Badge>
          </div>
          <Progress value={((currentExercise) / exercises.length) * 100} className="h-2" />
        </CardHeader>
      </Card>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentExercise + 1}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({currentExerciseData.points} points)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{currentExerciseData.question}</p>

          {currentExerciseData.type === "multiple-choice" && currentExerciseData.options && (
            <RadioGroup 
              value={answers[currentExercise] || ""} 
              onValueChange={handleAnswerChange}
            >
              {currentExerciseData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentExerciseData.type === "text" && (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[currentExercise] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="min-h-32"
            />
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentExercise === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentExercise]}
            >
              {currentExercise === exercises.length - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseExercises;
