import { Routes } from '@angular/router';
import { LoginComponent } from './principal/login/login.component';
import { DashboardComponent } from './principal/dashboard/dashboard.component';
import { HomeComponent } from './principal/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dash', component: DashboardComponent },
];
