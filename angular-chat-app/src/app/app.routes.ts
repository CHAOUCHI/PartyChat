import { Routes } from '@angular/router';
import { Room1Component } from './room1/room1.component';
import { Room2Component } from './room2/room2.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "room1", component: Room1Component },
    { path: "room2", component: Room2Component }
];
