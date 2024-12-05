import { Routes } from '@angular/router';
import { Room1Component } from './room1/room1.component';
import { HomeComponent } from './home/home.component';
import { CrudComponent } from './crud/crud.component';
import { WebcamComponent } from './webcam/webcam.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "room/:room", component: Room1Component },
    { path: "crud", component: CrudComponent},
    { path: "webcam", component: WebcamComponent}
];
