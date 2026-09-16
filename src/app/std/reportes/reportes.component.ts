import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reportes',
  imports: [RouterOutlet],
  templateUrl: './reportes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ReportesComponent {}