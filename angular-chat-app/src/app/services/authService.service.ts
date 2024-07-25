import { Injectable } from '@angular/core';
import { Payload } from '../interfaces/Payload';
import { connect } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // public userName: string = "";

  async login(email: string, password: string) {
    const url = 'https://192.168.1.180:3000/login';
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

  public payload() : Payload{
    // base64 (ascii) --> JSON(binary) : jsonToken = atob(token)
    // JSON --> ObjectTS : payload : Payload JSON.parse(jsonToken)

    return {
      name : "Massi",
      role : "admin"
    }
  }
}
