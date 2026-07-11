import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoexFiltradoComponent } from '../../registros/consultas/coex/coexFiltrado/coexFiltrado.component';

@Component({
  selector: 'app-coex-odonto',
  templateUrl: './coex-odonto.component.html',
  styleUrls: ['./coex-odonto.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CoexFiltradoComponent]
})
export class CoexOdontoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
