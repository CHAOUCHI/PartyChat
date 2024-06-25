import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  login(email:string , password:string) {

    fetch('http://localhost:3000/login')
  }
}