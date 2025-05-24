import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { SvgHomeComponent } from "../svg-home/svg-home.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, LoginComponent, SvgHomeComponent],
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

