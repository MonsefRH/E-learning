
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Save, ArrowLeft, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Slide {
  id: number;
  title: string;
  content: string;
  duration: number;
  avatarScript: string;
}

interface Exercise {
  id: number;
  type: "multiple-choice" | "text" | "practical";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

const CourseEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [courseTitle, setCourseTitle] = useState("Introduction to Machine Learning");
  const [courseDescription, setCourseDescription] = useState("Learn the fundamentals of machine learning with AI-powered interactive lessons.");
  
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: "What is Machine Learning?",
      content: "Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.",
      duration: 30,
      avatarScript: "Welcome to our machine learning course! Today we'll explore what machine learning really means and how it's transforming our world."
    },
    {
      id: 2,
      title: "Types of Machine Learning",
      content: "There are three main types: Supervised Learning, Unsupervised Learning, and Reinforcement Learning.",
      duration: 45,
      avatarScript: "Let's dive into the three fundamental types of machine learning. Each type has its own unique approach and applications."
    }
  ]);

  const [exercises, setExercises] = useState<Exercise[]>([
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
    }
  ]);

  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editingExercise, setEditingExercise] = useState<number | null>(null);

  const addSlide = () => {
    const newSlide: Slide = {
      id: slides.length + 1,
      title: "New Slide",
      content: "Add your content here...",
      duration: 30,
      avatarScript: "Add your avatar script here..."
    };
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (id: number) => {
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const updateSlide = (id: number, updates: Partial<Slide>) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, ...updates } : slide
    ));
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: exercises.length + 1,
      type: "multiple-choice",
      question: "New question?",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: 0,
      points: 10
    };
    setExercises([...exercises, newExercise]);
  };

  const deleteExercise = (id: number) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const updateExercise = (id: number, updates: Partial<Exercise>) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, ...updates } : exercise
    ));
  };

  const previewPresentation = () => {
    navigate(`/course/${courseId}/presentation`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{courseTitle}</h1>
                <p className="text-muted-foreground">Course Editor</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={previewPresentation}>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Course
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Avatar Presentation Slides</CardTitle>
                <Button onClick={addSlide}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <Card key={slide.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Slide {index + 1}: {slide.title}</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSlide(slide.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {editingSlide === slide.id && (
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Slide Title</Label>
                          <Input
                            value={slide.title}
                            onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={slide.content}
                            onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Avatar Script</Label>
                          <Textarea
                            value={slide.avatarScript}
                            onChange={(e) => updateSlide(slide.id, { avatarScript: e.target.value })}
                            rows={3}
                            placeholder="What the AI avatar should say for this slide..."
                          />
                        </div>
                        <div>
                          <Label>Duration (seconds)</Label>
                          <Input
                            type="number"
                            value={slide.duration}
                            onChange={(e) => updateSlide(slide.id, { duration: parseInt(e.target.value) })}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Course Exercises</CardTitle>
                <Button onClick={addExercise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">Exercise {index + 1}</h4>
                          <Badge>{exercise.type}</Badge>
                          <Badge variant="outline">{exercise.points} pts</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingExercise(editingExercise === exercise.id ? null : exercise.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteExercise(exercise.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {editingExercise === exercise.id && (
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Question</Label>
                          <Textarea
                            value={exercise.question}
                            onChange={(e) => updateExercise(exercise.id, { question: e.target.value })}
                            rows={2}
                          />
                        </div>
                        {exercise.type === "multiple-choice" && (
                          <div>
                            <Label>Options</Label>
                            {exercise.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 mt-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(exercise.options || [])];
                                    newOptions[optionIndex] = e.target.value;
                                    updateExercise(exercise.id, { options: newOptions });
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant={exercise.correctAnswer === optionIndex ? "default" : "outline"}
                                  onClick={() => updateExercise(exercise.id, { correctAnswer: optionIndex })}
                                >
                                  Correct
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div>
                          <Label>Points</Label>
                          <Input
                            type="number"
                            value={exercise.points}
                            onChange={(e) => updateExercise(exercise.id, { points: parseInt(e.target.value) })}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEditor;
