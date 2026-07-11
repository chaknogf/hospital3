import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CitasEspecialidadComponent } from '../../registros/citas/citasEspecialidad/citasEspecialidad.component';

@Component({
  selector: 'app-citas-nutri',
  templateUrl: './citas-nutri.component.html',
  styleUrls: ['./citas-nutri.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CitasEspecialidadComponent]
})
export class CitasNutriComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
