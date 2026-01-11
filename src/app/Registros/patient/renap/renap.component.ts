// renap.componente.ts
import { agregarPersonaIcon, regresarIcon } from './../../../shared/icons/svg-icon';
import { Renap } from './../../../interface/interfaces';
import { CommonModule, formatDate } from '@angular/common';
import { PacienteFiltros } from '../../../interface/paciente-filtros.model';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../service/api.service';
import { Router } from '@angular/router';
import { IconService } from '../../../service/icon.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-renap',
  standalone: true,
  templateUrl: './renap.component.html',
  styleUrls: ['./renap.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RenapComponent implements OnInit {

  options: { nombre: string; descripcion: string; ruta: string; icon?: SafeResourceUrl }[] = [];
  enRenap: Renap[] = [];
  cargando: boolean = false;
  filtrar: boolean = false;


  private sanitizarSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // svg
  regresarIcon: SafeHtml = regresarIcon
  agregarPersona: SafeHtml = agregarPersonaIcon
  constructor(
    private api: ApiService,
    private router: Router,
    private iconService: IconService,
    private sanitizer: DomSanitizer,
  ) {
    this.regresarIcon = this.sanitizarSvg(regresarIcon);
    this.agregarPersona = this.sanitizarSvg(agregarPersonaIcon);
  }

  ngOnInit() {
  }

  filtros = {
    cui: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    skip: 0,
    limit: 10
  }

  buscarPersona() {
    this.cargando = true;
    this.api.getRenapITD(this.filtros).subscribe({
      next: (data) => {
        this.enRenap = data;
      },
      error: (error) => {
        console.error("Error:", error);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  limpiarFiltros() {
    this.filtros = {
      cui: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha_nacimiento: '',
      skip: 0,
      limit: 10
    };

  }

  regresar() {
    this.router.navigate(['/paciente']);
  }

  agregarPaciente(persona: Renap) {
    let fechaNormalizada = '';
    if (persona.FECHA_NACIMIENTO) {
      const partes = persona.FECHA_NACIMIENTO.split('/');
      if (partes.length === 3) {
        const [dia, mes, anio] = partes;
        const fechaObj = new Date(Number(anio), Number(mes) - 1, Number(dia));
        fechaNormalizada = formatDate(fechaObj, 'yyyy-MM-dd', 'en-US');
      }
    }

    const datos = {
      cui: persona.CUI,
      nombre: {
        primer_nombre: persona.PRIMER_NOMBRE,
        segundo_nombre: persona.SEGUNDO_NOMBRE,
        otro_nombre: persona.TERCER_NOMBRE,
        primer_apellido: persona.PRIMER_APELLIDO,
        segundo_apellido: persona.SEGUNDO_APELLIDO,
        apellido_casada: persona.APELLIDO_CASADA,
      },
      fecha_nacimiento: fechaNormalizada,
      sexo: persona.SEXO === 'Hombre' ? 'M' : 'F',
      datos_extra: {
        r1: { tipo: 'estado_civil', valor: persona.ESTADO_CIVIL || '' },
        r11: { tipo: 'municipio_nacimiento', valor: persona.CUI?.slice(-4) || '' },
        r12: { tipo: 'departamento_nacimiento', valor: persona.CUI?.slice(9, 11) || '' },
      }
    };

    // console.log('Datos a enviar:', datos);
    this.router.navigate(['/paciente'], { state: { paciente: datos } });
  }

}
