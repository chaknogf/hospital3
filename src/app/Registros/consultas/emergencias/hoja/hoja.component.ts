import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../service/api.service';
import { Paciente } from '../../../../interface/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaBase } from '../../../../interface/consultas';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../../../pipes/edad.pipe';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { IconService } from '../../../../service/icon.service';


@Component({
  selector: 'app-hoja',
  templateUrl: './hoja.component.html',
  styleUrls: ['./hoja.component.css'],
  standalone: true,
  imports: [DatosExtraPipe, EdadPipe, DatePipe, CuiPipe, NgClass, CommonModule],
})
export class HojaComponent implements OnInit {
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
      back: this.iconService.getIcon("regresarIcon"),
      print: this.iconService.getIcon("printIcon"),
    }
  }

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
    this.router.navigate(['/emergencias']);
  }
}
