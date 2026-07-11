import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoexFiltradoComponent } from '../../registros/consultas/coex/coexFiltrado/coexFiltrado.component';

@Component({
  selector: 'app-coex-nutri',
  templateUrl: './coex-nutri.component.html',
  styleUrls: ['./coex-nutri.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CoexFiltradoComponent]
})
export class CoexNutriComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
