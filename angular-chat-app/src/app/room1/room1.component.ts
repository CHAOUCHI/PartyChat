import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { TchatService } from '../tchatService.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { isInArray } from '../../validators/isInArray';
import { NgClass, NgStyle } from '@angular/common';
import { AuthService } from '../authService.service';

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

  messageInput = new FormControl<string>("", [
    Validators.required,
    Validators.maxLength(255)
  ]);

  constructor(private tchatService: TchatService, private AuthService: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['room'] && !changes['room'].firstChange) {
      this.tchatService.disconnect();
      this.tchatService = new TchatService(); // Create a new instance of the service
      this.socketChanges();

      this.tchatService.joinRoom(changes['room'].currentValue, (response) => {
        console.log(`Joined room: ${this.room}`);
      });
      this.name = '';
      if (this.AuthService.isLogin()) {
      this.name = localStorage.getItem('user')!;
      this.tchatService.setName(this.name, (response) => {
        console.log(`Name set to: ${this.name}`);
      });
    }
      this.messages = [];
    }
  }

  ngOnInit(): void {
    if (this.AuthService.isLogin()) {
      this.name = localStorage.getItem('user')!;
      this.tchatService.setName(this.name, (response) => {
        console.log(`Name set to: ${this.name}`);
      });
    }
    
    this.socketChanges();

    if (this.room) {
      this.tchatService.joinRoom(this.room, (response) => {
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
    this.tchatService.onMessage((message: { name: string, msg: string, idSender: string, IDs: string[] }) => {
      const sentByUser = message.idSender === this.tchatService.socketId;
      const pingedUser = message.IDs.includes(this.tchatService.socketId);
      this.messages.push({ ...message, sentByUser, pingedUser });
      if (pingedUser) {
        this.showNotification(message.name, message.msg);
      }
    });

    this.tchatService.onConnectedSockets((sockets: { id: string, name: string }[]) => {
      this.connectedUsers = sockets;
      this.connectedUsersName = this.connectedUsers.map(user => user.name);
    });

    this.tchatService.onUserDisconnected((userId: string) => {
      // console.log(userId)
      this.connectedUsers = this.connectedUsers.filter(user => user.id !== userId);
      this.connectedUsersName = this.connectedUsers.map(user => user.name);
      console.log(this.connectedUsersName)
    });
  }

  // setName(event: Event): void {
  //   event.preventDefault();
    
  //   this.name = this.nameInput.value!;
  //   this.TchatService.setName(this.name, (response) => {
  //     console.log(`Name set to: ${this.name}`);
  //   });

  //   this.nameInput.reset();
  // }

  sendMessage(event: Event): void {
    event.preventDefault();
    this.message = this.messageInput.value!;
    const mentionedUserIds = this.getMentionedUserIds(this.message);

    this.tchatService.sendMessage(this.room, this.message, this.tchatService.socketId, mentionedUserIds);
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
