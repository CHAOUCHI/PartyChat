import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  async login(email: string, password: string) {
    const url = 'http://localhost:3000/login';
    const headers = new Headers();
    headers.append("Content-type", "application/json");
    const options: RequestInit = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        email: email,
        password: password
      }),
      credentials: 'include'
    };

    try {
      const response = await fetch(url, options);

      const result = await response.json();

      console.log(result);
    } catch (err) {
      console.error(err, 'err');
    }
  }
}
