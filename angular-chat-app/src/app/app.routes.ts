import { Routes } from '@angular/router';
import { Room1Component } from './room1/room1.component';
import { HomeComponent } from './home/home.component';
import { Room2Component } from './room2/room2.component';
import { CrudComponent } from './crud/crud.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "room/:room", component: Room1Component },
    { path: "room2", component: Room2Component },
    { path: "crud", component: CrudComponent}
];
