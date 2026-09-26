import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

/** Vista de consulta de signos vitales. */
@Component({
  selector: 'app-signosVitales',
  templateUrl: './signosVitales.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./signosVitales.component.css']
})
export class SignosVitalesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
