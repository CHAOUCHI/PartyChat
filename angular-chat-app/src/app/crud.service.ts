import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  public userName: string = "";
  public connected: boolean = false;

  constructor() { }

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
      const result = await response.json();

      if (result.name) {
        this.userName = result.name;
        this.connected = true;
        // console.log(this.userName);
      } else {
        console.log('Wrong password');
      }
    } catch (err) {
      console.error(err);
    }
  }
}
