import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, LoginComponent],
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  visible = signal(false);

  open() {
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }

}

