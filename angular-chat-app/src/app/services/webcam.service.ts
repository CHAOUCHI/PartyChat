import { Injectable, inject } from '@angular/core';
import { Socket } from 'socket.io-client';
import { TchatService } from './tchatService.service';

@Injectable({
  providedIn: 'root'
})
export class WebcamService {
  private localStream: MediaStream | null = null;

  private tchatService = inject(TchatService);

  async startWebcam(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      throw error;
    }
  }
  

  stopWebcam() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
