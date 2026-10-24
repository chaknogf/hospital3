import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Vista provisional del módulo de medicamentos de Enfermería. */
@Component({
  selector: 'app-enfermeria-medicamentos',
  standalone: true,
  templateUrl: './medicamentos-enfermeria.component.html',
  styleUrls: ['./medicamentos-enfermeria.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MedicamentosEnfermeriaComponent {}
