import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CitasEspecialidadComponent } from '../../registros/citas/citasEspecialidad/citasEspecialidad.component';

@Component({
  selector: 'app-citas-odonto',
  templateUrl: './citas-odonto.component.html',
  styleUrls: ['./citas-odonto.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CitasEspecialidadComponent]
})
export class CitasOdontoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
