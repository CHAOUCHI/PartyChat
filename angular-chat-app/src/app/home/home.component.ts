import { Component } from '@angular/core';
import { AuthService } from '../authService.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor( private AuthService: AuthService) {}
}
