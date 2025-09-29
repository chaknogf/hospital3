import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { DatePipe } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';
import { IconService } from '../../../../service/icon.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-HojaCoex',
  templateUrl: './HojaCoex.component.html',
  styleUrls: ['./HojaCoex.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe, TimePipe],
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

  options: { nombre: string; descripcion: string; ruta: string; icon: string }[] = [];

  // iconos
  icons: { [key: string]: any } = {};



  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private iconService: IconService

  ) {
    this.icons = {
      logo: this.iconService.getIcon("logoicon2"),
      back: this.iconService.getIcon("regresarIcon"),
      print: this.iconService.getIcon("printIcon")
    }
  }

  ngOnInit() {

    this.horaActual = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });
    this.fechaActual = new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
