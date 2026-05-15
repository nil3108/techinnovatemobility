/**
 * Camera utilities for capturing photos and recording videos
 * Uses the browser's MediaDevices API for real camera access
 */

export interface CameraCapabilities {
  hasCamera: boolean;
  hasMicrophone: boolean;
  errorMessage?: string;
}

// Check if camera is available
export async function checkCameraCapabilities(): Promise<CameraCapabilities> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { hasCamera: false, hasMicrophone: false, errorMessage: 'Camera not supported in this browser' };
    }
    
    // Try to access camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => track.stop());
    
    return { hasCamera: true, hasMicrophone: true };
  } catch (error: any) {
    return { 
      hasCamera: false, 
      hasMicrophone: false, 
      errorMessage: error.message || 'Camera access denied' 
    };
  }
}

// Capture a photo from camera
export async function capturePhoto(): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    await video.play();
    
    // Wait a bit for camera to adjust
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    // Stop camera
    stream.getTracks().forEach(track => track.stop());
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    return { success: true, dataUrl };
    
  } catch (error: any) {
    console.error('Photo capture failed:', error);
    return { success: false, error: error.message || 'Failed to capture photo' };
  }
}

// Record video
export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private onTimeUpdate?: (seconds: number) => void;
  
  async start(onTimeUpdate?: (seconds: number) => void): Promise<{ success: boolean; error?: string }> {
    try {
      this.onTimeUpdate = onTimeUpdate;
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true
      });
      
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(1000); // Collect data every second
      this.startTime = Date.now();
      
      // Update time every second
      const interval = setInterval(() => {
        if (this.mediaRecorder?.state === 'recording') {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          this.onTimeUpdate?.(elapsed);
        } else {
          clearInterval(interval);
        }
      }, 1000);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Video recording failed:', error);
      return { success: false, error: error.message || 'Failed to start recording' };
    }
  }
  
  stop(): Promise<{ success: boolean; blob?: Blob; duration?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve({ success: false, error: 'Not recording' });
        return;
      }
      
      const duration = Math.floor((Date.now() - this.startTime) / 1000);
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        // Keep stream alive for preview, stop only when explicitly closed
        resolve({ success: true, blob, duration });
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  getStream(): MediaStream | null {
    return this.stream;
  }
  
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Convert blob to base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Get current GPS location
export async function getCurrentLocation(): Promise<{ lat: number; lng: number; address?: string; error?: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 0, lng: 0, error: 'Geolocation not supported' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // Use default Vadodara coordinates on error
        resolve({
          lat: 22.3072,
          lng: 73.1812,
          error: error.message
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
