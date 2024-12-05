import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Offer } from '../interfaces/Offer';

@Injectable({
  providedIn: 'root'
})
export class TchatService {
  private readonly URL: string = 'https://192.168.10.119:3000';
  private socket: Socket | null = null;
  public socketId: string = '';
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private offerOn = false;
  private userName: string = '';

  

  connection() {
    if (this.socket) throw "Already connected";

    this.socket = io(this.URL);
    this.socket.on('your id', (id: string) => {
      this.socketId = id;
      console.log('My socket ID:', this.socketId);
    });
    this.socket.on('disconnect', (reason: string) => {
      this.socket = null;
      console.log('Disconnected:', reason);
    });
  }

  private getSocketId(): string | null {
    return this.socketId;
  }

  setName(name: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('getName', name, callback);
  }

  joinRoom(room: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('join room', room, (response: { status: string, message: string }) => {
        if (response.status === "1") {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }

  leaveRoom(room: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('leave room', room, callback);
  }

  sendMessage(room: string, msg: string, idSender: string, IDs: string[]): void {
    this.socket?.emit('chat message', { room, msg, idSender, IDs });
  }

  onMessage(callback: (data: { room: string, name: string, msg: string, idSender: string, IDs: string[] }) => void): void {
    this.socket?.on('chat message', callback);
  }

  onConnectedSockets(callback: (names: { id: string, name: string }[]) => void): void {
    this.socket?.on('connectedUsers', callback);
  }

  onUserDisconnected(callback: (userId: string) => void): void {
    this.socket?.on('userDisconnected', callback);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  emitCandidate(candidate: RTCIceCandidate): void {
    this.socket?.emit('candidate', candidate);
  }

  onOffer(callback: (offer : RTCSessionDescriptionInit)=> void): void {
    this.socket?.on('offer',callback);
  }

  onAnswer(callback: (answer: any)=> void): void {
    this.socket?.on('answer', callback);
  }

  onCandidate(callback: (candidate: RTCIceCandidate)=> void):void {
    this.socket?.on('candidate', callback)
  }

  emitOffer(offer: RTCSessionDescriptionInit): void {
    this.socket?.emit('offer', offer)
  }

  emitAnswer(answer: any): void {
    this.socket?.emit('answer', answer)
  }
}
