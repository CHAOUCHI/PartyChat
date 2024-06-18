import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('messageInputField') messageInputField!: ElementRef; // ViewChild to reference the input element

  messages: { name: string, msg: string }[] = [];
  message: string = '';
  room: string = '1';
  name: string = '';
  connectedUsers: { id: string, name: string }[] = [];
  connectedUsersName: string[] = [];
  showUsers: boolean = false


  constructor(private socketIoService: SocketIoService) {
    this.socketIoService.onMessage((message: { name: string, msg: string }) => {
      this.messages.push(message);
    });

    this.socketIoService.onConnectedSockets((sockets: { id: string, name: string }[]) => {
      this.connectedUsers = sockets;
      this.connectedUsersName = this.connectedUsers.map(user => user.name)
      console.log(this.connectedUsersName)
    });
  }

  nameInput = new FormControl<string>("", [
    Validators.required,
    Validators.pattern(/^[^\s]+$/)
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
    // if (this.mess)
    this.socketIoService.sendMessage(this.room, this.message);
    this.messageInput.reset();
    this.showUsers = false
  }

  callUser(event: MouseEvent) {
    const element = event.target as HTMLElement;
    const text = element.innerText;
    
    const parts = this.messageInput.value!.split('@');
    const newMs = parts.slice(0, parts.length - 1).join('@') + '@';

    this.messageInput.setValue(newMs + text);

    this.messageInputField.nativeElement.focus();
  }

  onInputChange(event: Event): void {
    const inputText = (event.target as HTMLInputElement).value;
    const i = inputText.lastIndexOf("@");
  
    if (i !== -1) {
      const tagname = inputText.substring(i + 1);
  
      if (i === inputText.length - 1 || (tagname.trim() !== "" && !tagname.includes(" ") && !tagname.endsWith(" "))) {
        // console.log(tagname.trim());
  
        this.showUsers = this.connectedUsersName.some(userName =>
          userName.toLowerCase().startsWith(tagname.trim().toLowerCase())
        );
      } else {
        this.showUsers = false;
      }
    } else {
      this.showUsers = false;
    }
  }
  

  private getMentionedUser() {
  }
}