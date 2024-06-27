import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // public userName: string = "";
  public connected: boolean = false;

  constructor() {
    this.connected = this.isLogin();
  }

  async login(email: string, password: string) {
    const url = 'http://localhost:3000/login';
    const headers = new Headers({ "Content-Type": "application/json" });
    const options: RequestInit = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    };

    try {
      const response = await fetch(url, options);
      const connectedUser = await response.json();

      if (response.ok) {
        // this.userName = connectedUser.name;
        localStorage.setItem('connected', 'true');
        localStorage.setItem('user', connectedUser.name);
        this.connected = true;
        // console.log(this.userName);
      } else {
        console.log('Wrong password');
      }
    } catch (err) {
      console.error(err);
    }
  }

  isLogin(): boolean {
    const connected = localStorage.getItem('connected');

    if (connected === 'true') {
      return true;
    } else {
      return false;
    }
  }
}
