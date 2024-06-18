import { Injectable } from '@angular/core';
import { io, Socket} from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private readonly URL: string = 'http://localhost:3000';
  private socket: Socket  = io(this.URL);


  setName(name: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket.emit('getName', name, callback);
  }

  joinRoom(room: string, callback: (response: { status: string, message: string }) => void): void {
    this.socket.emit('join room', room, callback);
  }

  sendMessage(room: string, msg: string): void {
    this.socket.emit('chat message', { room, msg });
  }

  onMessage(callback: (data: { name: string, msg: string }) => void): void {
    this.socket.on('chat message', callback);
  }

  onConnectedSockets(callback: (names: { id: string, name: string}[]) => void): void {
    this.socket.on('connectedUsers', callback);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
