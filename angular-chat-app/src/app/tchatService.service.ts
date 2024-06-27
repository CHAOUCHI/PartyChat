import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TchatService {
  private readonly URL: string = 'http://localhost:3000';
  private socket: Socket | null = null;
  public socketId: string = '';

  connection(){
    if(this.socket) throw "Already connected";

    this.socket = io(this.URL);
    this.socket.on('your id', (id: string) => {
      this.socketId = id;
      // console.log('My socket ID:', this.socketId);
    });
    this.socket.on('disconnect', (reason : string) => {
      this.socket = null;
      // console.log('My socket ID:', this.socketId);
    });
  }

  getSocketId(): string | null {
    return this.socketId;
  }

  setName(name: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('getName', name, callback);
  }

  joinRoom(room: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket?.emit('join room', room, callback);
  }

  leaveRoom(room: string, callback: (response: { status: string, message: string}) => void): void {
    this.socket?.emit('leave room', room, callback)
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
    // console.log(callback)
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  onWebcam(callback: (data: Blob) => void) {
    this.socket?.on('videoStream', callback);
  }

  sendVideoStream(data: Blob) {
    this.socket?.emit('videoStream', data);
  }
}
