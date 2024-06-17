import { Component } from '@angular/core';
import { SocketIoService } from '../socket.io.service';

@Component({
  selector: 'app-room1',
  standalone: true,
  imports: [],
  templateUrl: './room1.component.html',
  styleUrl: './room1.component.css'
})
export class Room1Component {
  message: string = '';
  room: string = '1';
  name: string = ''

  constructor(private socketIoService: SocketIoService) {}

  ngOnInit() {
    this.socketIoService.joinRoom(this.room, (response) => {
      console.log(response);
    });
  }
}
