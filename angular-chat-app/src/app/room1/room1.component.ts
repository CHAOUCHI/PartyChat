import { Component, OnInit } from '@angular/core';
import { SocketIoService } from '../socket.io.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-room1',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './room1.component.html',
  styleUrls: ['./room1.component.css']
})
export class Room1Component implements OnInit {
  messages: { name: string, msg: string }[] = [];
  message: string = '';
  room: string = '1';
  name: string = '';

  constructor(private socketIoService: SocketIoService) { 
    this.socketIoService.onMessage((message: { name: string, msg: string }) => {
      this.messages.push(message);
    });
  }

  nameInput = new FormControl<string>("",[
    Validators.required
  ])

  messageInput = new FormControl<string>("", [
    Validators.required,
    Validators.maxLength(255)
  ]);

  ngOnInit(): void {
    this.socketIoService.joinRoom(this.room, (response) => {
      console.log(response);
    });
  }

  setName(event: Event): void {
    event.preventDefault();
    this.name = this.nameInput.value!;
    this.socketIoService.setName(this.name, (response) => {
      console.log(response);
    });
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    this.message = this.messageInput.value!;
    this.socketIoService.sendMessage(this.room, this.message);
    this.messageInput.reset();
  }
}
