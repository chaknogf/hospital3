import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CitasEspecialidadComponent } from '../../registros/citas/citasEspecialidad/citasEspecialidad.component';

/** Muestra las citas correspondientes a la atención nutricional. */
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
