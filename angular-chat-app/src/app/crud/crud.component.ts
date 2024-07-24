import { Component } from '@angular/core';
import { AuthService } from '../services/authService.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule,  } from '@angular/forms';


@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent {

  constructor(public AuthService: AuthService) {}

  loginForm = new FormGroup({
    email: new FormControl<string>("", [
      Validators.required
    ]),
    password: new FormControl<string>("",
      Validators.required
    )
  })

  async submitLog(event: Event) {
    event.preventDefault();
    const email = this.loginForm.get('email')?.value!;
    const password = this.loginForm.get('password')?.value!;
    await this.AuthService.login(email,password); 
  }
}
