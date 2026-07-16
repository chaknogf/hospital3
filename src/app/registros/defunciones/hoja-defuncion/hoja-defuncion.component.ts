import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DefuncionInformeComponent } from '../defuncion-informe/defuncion-informe.component';

@Component({
  selector: 'app-hoja-defuncion',
  standalone: true,
  templateUrl: './hoja-defuncion.component.html',
  styleUrls: ['./hoja-defuncion.component.css'],
  imports: [CommonModule, DefuncionInformeComponent]
})
export class HojaDefuncionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  defuncionId = signal<number | null>(null);
  cargado = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.defuncionId.set(id);
    }
  }

  onCargado(): void {
    this.cargado.set(true);
  }

  imprimir(): void {
    window.print();
  }

  regresar(): void {
    this.router.navigate(['/defunciones']);
  }
}
