import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioCaptureProps {
  className?: string;
}

export const AudioCapture = ({ className }: AudioCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Speak your question clearly",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      toast({
        title: "Recording stopped",
        description: "Review your question before sending",
      });
    }
  }, [isRecording, toast]);

  const submitAudio = useCallback(async () => {
    if (!audioBlob) return;

    try {
      // Initialize WebSocket
      const ws = new WebSocket("ws://localhost:8001/audio/ws/transcribe");
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(audioBlob); // Send audio blob
        toast({
          title: "Audio sent",
          description: "Processing your audio question...",
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcription) {
          setTranscription(data.transcription);
          toast({
            title: "Transcription received",
            description: `Your question: ${data.transcription}`,
          });
        } else if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "WebSocket error",
          description: "Failed to connect to server.",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
      };

      clearRecording();
    } catch (error) {
      console.error("Error submitting audio:", error);
      toast({
        title: "Submission failed",
        description: "Unable to process audio. Please try again.",
        variant: "destructive",
      });
    }
  }, [audioBlob, toast]);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription(null);
  }, [audioUrl]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
              disabled={!!audioBlob}
            >
              <Mic className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              size="lg"
              className="rounded-full w-16 h-16 bg-gray-500 hover:bg-gray-600 animate-pulse"
            >
              <MicOff className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isRecording ? (
            <span className="text-red-500 font-medium">Recording... Click to stop</span>
          ) : audioBlob ? (
            "Recording ready to send"
          ) : (
            "Click the microphone to start recording"
          )}
        </div>

        {audioBlob && audioUrl && (
          <div className="space-y-3">
            <audio controls src={audioUrl} className="w-full" preload="metadata" />
            <div className="flex gap-2 justify-center">
              <Button onClick={submitAudio} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Question
              </Button>
              <Button onClick={clearRecording} variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {transcription && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Transcription:</p>
            <p className="text-sm">{transcription}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Make sure your microphone is connected and permissions are granted
        </div>
      </CardContent>
    </Card>
  );
};