import { routes } from './../../../app.routes';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ConstanciasService } from '../constancias.service';
import { ApiService } from '../../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-hoja-cnacimiento',
  templateUrl: './hoja-cnacimiento.component.html',
  styleUrls: ['./hoja-cnacimiento.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HojaCnacimientoComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apis = inject(ApiService);
  private api = inject(ConstanciasService);


  constructor() { }

  ngOnInit() {
  }

}
