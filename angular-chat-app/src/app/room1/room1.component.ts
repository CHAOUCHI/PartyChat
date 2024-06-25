import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { SocketIoService } from '../socket.io.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { isInArray } from '../../validators/isInArray';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-room1',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgStyle],
  templateUrl: './room1.component.html',
  styleUrls: ['./room1.component.css']
})
export class Room1Component implements OnInit, OnChanges {
  @ViewChild('messageInputField') messageInputField!: ElementRef;

  messages: { name: string, msg: string, sentByUser: boolean, pingedUser: boolean }[] = [];
  message: string = '';
  @Input() room: string = '';
  name: string = '';
  connectedUsers: { id: string, name: string }[] = [];
  connectedUsersName: string[] = [];
  showUsers: boolean = false;

  nameInput = new FormControl<string>("", [
    Validators.required,
    Validators.pattern(/^[^\s]+$/)
  ]);

  messageInput = new FormControl<string>("", [
    Validators.required,
    Validators.maxLength(255)
  ]);

  constructor(private socketIoService: SocketIoService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['room'] && !changes['room'].firstChange) {
      this.socketIoService.disconnect();
      this.socketIoService = new SocketIoService(); // Create a new instance of the service
      this.socketChanges();

      this.socketIoService.joinRoom(changes['room'].currentValue, (response) => {
        console.log(`Joined room: ${this.room}`);
      });
      this.name = '';
      this.messages = [];
    }
  }

  ngOnInit(): void {
    this.socketChanges();

    if (this.room) {
      this.socketIoService.joinRoom(this.room, (response) => {
        console.log(`Joined room: ${this.room}`);
      });
    }

    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    }
  }

  socketChanges() {
    this.socketIoService.onMessage((message: { name: string, msg: string, idSender: string, IDs: string[] }) => {
      const sentByUser = message.idSender === this.socketIoService.socketId;
      const pingedUser = message.IDs.includes(this.socketIoService.socketId);
      this.messages.push({ ...message, sentByUser, pingedUser });
      if (pingedUser) {
        this.showNotification(message.name, message.msg);
      }
    });

    this.socketIoService.onConnectedSockets((sockets: { id: string, name: string }[]) => {
      this.connectedUsers = sockets;
      this.connectedUsersName = this.connectedUsers.map(user => user.name);
      this.updateValidator();
    });

    this.socketIoService.onUserDisconnected((userId: string) => {
      // console.log(userId)
      this.connectedUsers = this.connectedUsers.filter(user => user.id !== userId);
      this.connectedUsersName = this.connectedUsers.map(user => user.name);
      console.log(this.connectedUsersName)
      this.updateValidator();
    });
  }

  updateValidator() {
    this.nameInput.setValidators([
      Validators.required,
      Validators.pattern(/^[^\s]+$/),
      isInArray(this.connectedUsersName)
    ]);
    this.nameInput.updateValueAndValidity();
  }

  setName(event: Event): void {
    event.preventDefault();
    
    this.name = this.nameInput.value!;
    this.socketIoService.setName(this.name, (response) => {
      console.log(`Name set to: ${this.name}`);
    });

    this.nameInput.reset();
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    this.message = this.messageInput.value!;
    const mentionedUserIds = this.getMentionedUserIds(this.message);

    this.socketIoService.sendMessage(this.room, this.message, this.socketIoService.socketId, mentionedUserIds);
    this.messageInput.reset();
    this.showUsers = false;
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

  private getMentionedUserIds(message: string): string[] {
    const pattern = /@(\w+)/g;
    let mentionedUserIds: string[] = [];
    let match;

    while ((match = pattern.exec(message)) !== null) {
      const username = match[1];
      const user = this.connectedUsers.find(u => u.name === username);
      if (user) {
        mentionedUserIds.push(user.id);
      }
    }

    return mentionedUserIds;
  }

  private showNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      const options = {
        body: body,
        icon: 'path/to/icon.png' // You can specify an icon for the notification
      };
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
      };
    }
  }
}
