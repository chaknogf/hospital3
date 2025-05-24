import { Routes } from '@angular/router';
import { LoginComponent } from './principal/login/login.component';
import { DashboardComponent } from './principal/dashboard/dashboard.component';
import { HomeComponent } from './principal/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'hospital3', pathMatch: 'full' },
  { path: 'hospital3', component: HomeComponent },
  { path: 'dash', component: DashboardComponent },
];
