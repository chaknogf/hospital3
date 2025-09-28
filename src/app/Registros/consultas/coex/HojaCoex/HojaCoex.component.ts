import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { DatePipe } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';

@Component({
  selector: 'app-HojaCoex',
  templateUrl: './HojaCoex.component.html',
  styleUrls: ['./HojaCoex.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe],
})
export class HojaCoexComponent implements OnInit {
  public paciente: Paciente | undefined;
  public consulta: ConsultaBase | undefined;
  public fechaActual: string = "";
  public horaActual: string = "";
  public rutaAnterior: string = '../';
  public contador: number = 0;
  public e: any = '';
  public detalleVisible: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute   // ✅ inyectamos ActivatedRoute
  ) { }

  ngOnInit() {
    // 👇 obtenemos el id de la URL
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarDatos(id);
    }
  }

  async cargarDatos(id: number) {
    try {
      // 👉 primero obtenemos la consulta
      this.consulta = await this.api.getConsultaId(id);

      // 👉 luego obtenemos el paciente usando el id de la consulta
      if (this.consulta?.paciente_id) {
        this.paciente = await this.api.getPaciente(this.consulta.paciente_id);
      }

      this.detalleVisible = true;
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
  }

  imprimir() {
    window.print();
  }

  regresar() {
    this.router.navigate(['/coex']);
  }
}
