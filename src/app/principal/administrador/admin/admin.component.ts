
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IconService } from '../../../service/icon.service';
import { Sigsa3Service } from '../../../std/sigsa3/sigsa3.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})
export class AdminComponent implements OnInit {

  options: { nombre: string; descripcion: string; ruta: string; icon: string; accion?: () => void }[] = [];

  // iconos
  icons: { [key: string]: any } = {};



  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private iconService: IconService,
    private sigsa3: Sigsa3Service
  ) {
    this.icons = {
      menu: this.iconService.getIcon("menuIcon"),
      paciente: this.iconService.getIcon("patientIcon"),
      ambulance: this.iconService.getIcon("ambulanceIcon"),
      cmedic: this.iconService.getIcon("consultaMedica"),
      ingresoIcon: this.iconService.getIcon("ingresoIcon"),
      consultas: this.iconService.getIcon("consultasIcon"),
      archivo: this.iconService.getIcon("archivoIcon"),
      compartir: this.iconService.getIcon("compartirIcon"),
      calendar: this.iconService.getIcon("calendarIcon"),
      baby: this.iconService.getIcon("babyIcon"),
      persons: this.iconService.getIcon("persons2")

    }




  }

  ngOnInit() {

    this.options = [

      { nombre: 'Usuarios', descripcion: 'Gestionar Usuarios', ruta: '/usuarios', icon: '' },
      { nombre: 'Registrar', descripcion: 'Registrar Usuario', ruta: '/newuser', icon: '' },
      { nombre: 'Fusionar Pacientes', descripcion: 'Unir registros duplicados', ruta: '/merge-pacientes', icon: '' },
      { nombre: 'Desactivar Consulta', descripcion: 'Cambiar estado a descartado', ruta: '/desactivar-consulta', icon: '' },
      { nombre: 'Eliminar Consulta', descripcion: 'Eliminar consulta permanentemente', ruta: '/eliminar-consulta', icon: '' },
      { nombre: 'Eliminar Constancia', descripcion: 'Eliminar constancia de nacimiento', ruta: '/eliminar-constancia', icon: '' },
      { nombre: 'Reasignar Paciente', descripcion: 'Reasignar paciente en consulta (XX/desconocido)', ruta: '/consultas/0/reasignar-paciente', icon: '' },
      { nombre: 'Eliminar Paciente', descripcion: 'Eliminar paciente permanentemente', ruta: '/eliminar-paciente', icon: '' },
      { nombre: 'Limpiar CUI', descripcion: 'Limpiar número de CUI de un paciente', ruta: '/limpiar-cui-paciente', icon: '' },
      { nombre: 'Municipios', descripcion: 'Gestionar catálogo de municipios', ruta: '/gestion-municipios', icon: '' },
      { nombre: 'Encamamiento', descripcion: 'Gestionar servicios y camas', ruta: '/gestion-encamamiento', icon: '' },
      { nombre: 'Menu', descripcion: 'Regresar al menu principal', ruta: '/dash', icon: 'menu' },
      { nombre: 'Exportar SIGSA-3 CSV', descripcion: 'Descargar todos los registros SIGSA-3 como CSV', ruta: '', icon: '', accion: () => this.exportarCsv() },
      { nombre: 'Truncar SIGSA-3', descripcion: 'Eliminar TODOS los registros SIGSA-3 (irreversible)', ruta: '', icon: '', accion: () => this.truncar() },

    ];



  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  private exportarCsv(): void {
    this.sigsa3.exportarCsv().pipe(take(1)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sigsa3_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  private truncar(): void {
    if (!confirm('⚠️ ¿TRUNCAR toda la tabla SIGSA-3?\n\nEsta acción es irreversible y eliminará TODOS los registros.\n¿Estás seguro?')) return;
    if (!confirm('⚠️ CONFIRMACIÓN FINAL\n\n¿Estás 100% seguro de eliminar todos los datos SIGSA-3?')) return;
    this.sigsa3.truncate().pipe(take(1)).subscribe();
  }

}
