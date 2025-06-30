
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, SkipBack, Volume2, MessageCircle } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  content: string;
  duration: number;
  avatarScript: string;
}

interface AvatarPresentationProps {
  courseId: string;
  courseTitle: string;
  slides: Slide[];
  onComplete?: () => void;
}

const AvatarPresentation = ({ courseId, courseTitle, slides, onComplete }: AvatarPresentationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  // Simulate avatar speaking animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isAvatarSpeaking) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / slides[currentSlide].duration);
          if (newProgress >= 100) {
            setIsAvatarSpeaking(false);
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAvatarSpeaking, currentSlide, slides]);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsAvatarSpeaking(true);
    setProgress(0);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsAvatarSpeaking(false);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setProgress(0);
      setIsPlaying(false);
      setIsAvatarSpeaking(false);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setProgress(0);
      setIsPlaying(false);
      setIsAvatarSpeaking(false);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{courseTitle}</CardTitle>
                <p className="text-muted-foreground">
                  Slide {currentSlide + 1} of {slides.length}
                </p>
              </div>
              <Badge variant="outline">AI Avatar Presentation</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Presentation Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Avatar Video Simulation */}
            <Card className="aspect-video">
              <CardContent className="p-0 h-full">
                <div className="relative h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                  {/* Avatar Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold transition-transform duration-300 ${
                      isAvatarSpeaking ? 'scale-110' : 'scale-100'
                    }`}>
                      AI
                    </div>
                  </div>
                  
                  {/* Speaking Animation */}
                  {isAvatarSpeaking && (
                    <div className="absolute bottom-4 left-4 flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentSlide === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  {!isPlaying ? (
                    <Button onClick={handlePlay} size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </Button>
                  ) : (
                    <Button onClick={handlePause} size="lg" variant="outline">
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1 && progress < 100}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slide Content */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentSlideData.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentSlideData.content}
                </p>
                
                {/* Avatar Script Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Avatar Script:</h4>
                  <p className="text-xs text-gray-600 italic">
                    "{currentSlideData.avatarScript}"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ask Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Ask AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Ask Question About This Slide
                </Button>
              </CardContent>
            </Card>

            {/* Slide Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Slides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        index === currentSlide
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {index + 1}. {slide.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPresentation;
