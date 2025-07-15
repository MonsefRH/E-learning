import { API_URL } from "@/lib/api";
import api from "@/lib/api";

interface QAMessage {
  type: "text_question" | "voice_question" | "auth";
  question?: string;
  audio_data?: string;
  course_id?: string;
  token?: string;
}

interface QAResponse {
  type: "transcription_ready" | "text_response" | "error" | "auth_success" | "audio_ready" | "animation_ready";
  transcribed_text?: string;
  text?: string;
  message?: string;
  audio_data?: string;
  audio_format?: string;
  status?: string;
}

class QAService {
  private ws: WebSocket | null = null;
  private onMessageCallback?: (response: QAResponse) => void;
  private token: string | null = null;
  private isAuthenticated = false;
  private isConnecting = false;

  constructor() {
    this.token = localStorage.getItem("token"); // Use dummy token for testing
    console.log("QAService initialized with token:", this.token ? this.token.substring(0, 10) + "..." : "none");
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null;
          this.isAuthenticated = false;
          localStorage.removeItem("token");
          console.log("Token invalidated due to 401");
          if (this.ws) {
            this.ws.close(); // Close WebSocket on invalidation
          }
        }
        return Promise.reject(error);
      }
    );
  }

  connect(courseId?: string, onMessage?: (response: QAResponse) => void) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.isConnecting) return;
    this.isConnecting = true;
    this.onMessageCallback = onMessage;
    const wsUrl = `${API_URL.replace("http", "ws")}/qa/ws`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.token) {
        this.sendMessage({ type: "auth", token: this.token });
        console.log("Sent auth message with token");
      } else {
        console.log("No token available for authentication");
        this.isConnecting = false; // Allow connection to proceed without auth for testing
      }
    };

    this.ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      const data = JSON.parse(event.data) as QAResponse;
      if (data.type === "auth_success") {
        this.isAuthenticated = true;
        this.isConnecting = false;
        console.log("Authentication successful");
      } else if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnecting = false;
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
      this.ws = null;
      this.isAuthenticated = false;
      this.isConnecting = false;
    };
  }

  async sendMessage(message: QAMessage): Promise<void> {
    if (!this.ws) {
      console.log("WebSocket not initialized, connecting...");
      this.connect();
    }
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log("Waiting for WebSocket to connect...");
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve(null);
          }
        }, 100);
      });
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected, message not sent:", message);
      throw new Error("WebSocket not connected");
    }
    if ((message.type === "text_question" && !message.question) || (message.type === "voice_question" && !message.audio_data)) {
      console.error("Message content cannot be empty, message not sent:", message);
      throw new Error("Message content cannot be empty");
    }
    console.log("Sending message:", message);
    this.ws.send(JSON.stringify(message));
  }

  async transcribeAudio(audioBlob: Blob, courseId?: string): Promise<string> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "chatbot.webm");
    if (courseId) formData.append("course_id", courseId);

    try {
      const response = await api.post(`${API_URL}/qa/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.transcribed_text || "";
    } catch (error) {
      console.error("Transcription error:", error);
      return "";
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      console.log("WebSocket closed manually");
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const qaService = new QAService();