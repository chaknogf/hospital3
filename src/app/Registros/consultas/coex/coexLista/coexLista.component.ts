// coexLista.component.ts

import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EdadPipe } from '../../../../pipes/edad.pipe';
import { DatosExtraPipe } from '../../../../pipes/datos-extra.pipe';
import { CuiPipe } from '../../../../pipes/cui.pipe';
import { TimePipe } from '../../../../pipes/time.pipe';

import { Paciente, } from '../../../../interface/interfaces';
import { ConsultaResponse, Ciclo, TotalesResponse, TotalesItem } from '../../../../interface/consultas';
import { ciclos, Dict } from '../../../../enum/diccionarios';

import { ApiService } from '../../../../service/api.service';
import { ConsultaService } from '../../../../service/axios.service';
import { IconService } from '../../../../service/icon.service';

@Component({
  selector: 'app-coexLista',
  templateUrl: './coexLista.component.html',
  styleUrls: ['./coexLista.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe, CuiPipe, TimePipe]
})
export class CoexListaComponent implements OnInit {

  esEmergencia = true;
  consultas: ConsultaResponse[] = [];
  medi: ConsultaResponse[] = [];
  pedia: ConsultaResponse[] = [];
  gine: ConsultaResponse[] = [];
  ciru: ConsultaResponse[] = [];
  trauma: ConsultaResponse[] = [];
  psico: ConsultaResponse[] = [];
  nutri: ConsultaResponse[] = [];
  odonto: ConsultaResponse[] = [];

  // ✅ Corregido: ahora es TotalesItem[]
  totales: TotalesItem[] = [];

  paciente: Paciente | null = null;
  public status: 'activo' | 'inactivo' | 'none' = 'none';
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  espacio: string = ' ';
  pageSize: number = 9;
  paginaActual: number = 1;
  finPagina: boolean = false;

  private ahora = new Date();
  fechaActual = '';

  totalDeRegistros = 0;
  porcentajeDeCarga = 0;
  especialidadSeleccionada: string = '';
  ciclos: Dict[] = ciclos;

  filtros: any = {
    skip: 0,
    limit: this.pageSize,
    tipo_consulta: 1,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha: '',
    ciclo: '',
    especialidad: '',
    servicio: '',
    expediente: '',
  };

  // iconos (ahora inyectados por servicio)
  icons: { [key: string]: any } = {};

  constructor(
    private pacienteData: ApiService,
    private api: ApiService,
    private router: Router,
    private iconService: IconService
  ) {
    this.icons = {
      odont: this.iconService.getIcon("odontoIcon"),
      nutri: this.iconService.getIcon("nutriIcon"),
      psico: this.iconService.getIcon("psicoIcon"),
      trauma: this.iconService.getIcon("traumaIcon"),
      ciru: this.iconService.getIcon("ciruIcon"),
      gine: this.iconService.getIcon("gineIcon"),
      pedia: this.iconService.getIcon("pediaIcon"),
      medicina: this.iconService.getIcon("medicinaIcon"),
      docuento: this.iconService.getIcon("documentoIcon"),
      activo: this.iconService.getIcon("activoIcon"),
      search: this.iconService.getIcon("searchIcon"),
      delete: this.iconService.getIcon("deletInput"),
      create: this.iconService.getIcon("createIcon"),
      edit: this.iconService.getIcon("editIcon"),
      trash: this.iconService.getIcon("trashIcon"),
      tabla: this.iconService.getIcon("tablaShanonIcon"),
      medical: this.iconService.getIcon("medicalServiceIcon"),
      man: this.iconService.getIcon("manIcon"),
      woman: this.iconService.getIcon("womanIcon"),
      paw: this.iconService.getIcon("huellitaIcon"),
      find: this.iconService.getIcon("findIcon"),
      menu: this.iconService.getIcon("menuPuntos"),
      arrowDown: this.iconService.getIcon("arrowDown"),
      skipLeft: this.iconService.getIcon("skipLeft"),
      skipRight: this.iconService.getIcon("skipRight"),
      print: this.iconService.getIcon("printIcon"),
    };
  }

  // Cambios necesarios en coexLista.component.ts

  // 1️⃣ PROBLEMA EN ngOnInit - filtrosIniciales no incluye todos los campos
  ngOnInit(): void {
    this.fechaActual = this.ahora.toLocaleDateString('en-CA');
    this.filtros.fecha = this.fechaActual;
    this.filtros.limit = this.pageSize;

    // 2️⃣ Obtener totales
    this.api.getTotales(this.fechaActual).subscribe({
      next: (response: TotalesResponse) => {
        this.totales = response.totales;
        const consultasCoex = this.totales.find(t =>
          t.entidad.toLowerCase().includes('coex')
        );
        this.totalDeRegistros = consultasCoex?.total || 0;
      },
      error: (err) => {
        console.error('❌ Error al cargar totales:', err);
        this.totales = [];
        this.totalDeRegistros = 0;
      }
    });

    // 3️⃣ FIX: Usar this.filtros en lugar de crear un objeto nuevo
    this.cargarConsultas();
  }

  // 2️⃣ PROBLEMA EN cargarConsultas - necesita limpiar filtros vacíos
  async cargarConsultas(filtros?: any) {
    this.cargando = true;
    const filtrosAUsar = filtros || this.filtros;

    // ✅ FIX: Limpiar filtros vacíos antes de enviar
    const filtrosLimpios = this.limpiarFiltrosVacios(filtrosAUsar);

    this.api.getConsultas(filtrosLimpios).subscribe({
      next: (data: ConsultaResponse[]) => {
        this.consultas = data;

        // ✅ Filtrar por especialidad localmente (una sola vez)
        // this.filtrarPorEspecialidadLocal();

        // console.log('✅ Consultas cargadas:', {
        //   total: this.consultas.length,
        //   filtros: filtrosLimpios,
        //   especialidadSeleccionada: this.especialidadSeleccionada
        // });
      },
      error: (err) => {
        console.error('❌ Error al cargar consultas:', err);
        this.consultas = [];
        this.medi = [];
        this.pedia = [];
        this.gine = [];
        this.ciru = [];
        this.trauma = [];
        this.psico = [];
        this.nutri = [];
        this.odonto = [];
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  // 3️⃣ NUEVO MÉTODO: Limpiar filtros vacíos
  private limpiarFiltrosVacios(filtros: any): any {
    const filtrosLimpios: any = {};

    for (const key in filtros) {
      const valor = filtros[key];

      // Incluir solo valores que no sean vacíos
      if (valor !== '' && valor !== null && valor !== undefined) {
        filtrosLimpios[key] = valor;
      }

      // Siempre incluir skip, limit y tipo_consulta
      if (key === 'skip' || key === 'limit' || key === 'tipo_consulta') {
        filtrosLimpios[key] = valor;
      }
    }

    return filtrosLimpios;
  }

  // 4️⃣ FIX EN buscar() - Asegurar que fecha_consulta se envíe
  buscar() {
    this.filtros.skip = 0;
    this.paginaActual = 1;
    this.especialidadSeleccionada = '';
    this.filtros.especialidad = '';

    // ✅ Asegurar que la fecha actual esté en los filtros
    if (!this.filtros.fecha) {
      this.filtros.fecha = this.fechaActual;
    }



    // console.log('🔍 Buscando con filtros:', this.filtros);
    this.filtrarPorEspecialidadLocal();
  }

  // 5️⃣ FIX EN limpiarFiltros() - Mantener fecha actual
  limpiarFiltros() {
    this.filtros = {
      skip: 0,
      limit: this.pageSize,
      tipo_consulta: 1,
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      fecha: this.fechaActual,
      ciclo: '',
      especialidad: '',
      servicio: '',
      expediente: ''
    };
    this.paginaActual = 1;
    this.especialidadSeleccionada = '';
    this.cargarConsultas();
  }

  // 6️⃣ NUEVO MÉTODO: Para cambiar fecha desde el template
  cambiarFecha() {
    this.filtros.skip = 0;
    this.paginaActual = 1;
    this.especialidadSeleccionada = '';
    this.filtros.especialidad = '';

    // Actualizar totales con la nueva fecha
    this.api.getTotales(this.filtros.fecha).subscribe({
      next: (response: TotalesResponse) => {
        this.totales = response.totales;
        const consultasCoex = this.totales.find(t =>
          t.entidad.toLowerCase().includes('coex')
        );
        this.totalDeRegistros = consultasCoex?.total || 0;
      },
      error: (err) => {
        console.error('❌ Error al cargar totales:', err);
      }
    });

    this.cargarConsultas();
  }

  // ✅ Método auxiliar para filtrar localmente por especialidad
  private filtrarPorEspecialidadLocal() {

    this.medi = this.consultas.filter(c => c.especialidad === 'MEDI');
    this.pedia = this.consultas.filter(c => c.especialidad === 'PEDI');
    this.gine = this.consultas.filter(c => c.especialidad === 'GINE');
    this.ciru = this.consultas.filter(c => c.especialidad === 'CIRU');
    this.trauma = this.consultas.filter(c => c.especialidad === 'TRAU');
    this.psico = this.consultas.filter(c => c.especialidad === 'PSIC');
    this.nutri = this.consultas.filter(c => c.especialidad === 'NUTR');
    this.odonto = this.consultas.filter(c => c.especialidad === 'ODON');
  }

  seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;

    // ✅ Actualizar filtros con la especialidad seleccionada
    this.filtros.especialidad = especialidad;
    this.filtros.skip = 0; // Resetear a primera página
    this.paginaActual = 1;

    // console.log(this.filtros);

    // ✅ Un solo llamado con los filtros actualizados
    this.cargarConsultas();
  }



  editar(id: number) {
    this.router.navigate(['/editarAdmision', id, 'coex']);
  }

  agregar() {
    this.router.navigate(['/pacientes']);
  }

  verDetalle(consultaId: number) {
    this.router.navigate(
      ['/detalleAdmision', consultaId],
      { queryParams: { origen: 'coex' } }
    );
  }

  toggleFiltrar() {
    this.filtrar = !this.filtrar;
  }

  imprimir(consultaId: number) {
    this.router.navigate(['/hojaCoex', consultaId]);
  }

  volver() {
    this.router.navigate(['/registros']);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalDeRegistros / this.pageSize) || 1;
  }

  cambiarPagina(paso: number) {
    this.paginaActual += paso;

    if (this.paginaActual < 1) this.paginaActual = 1;
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;

    this.filtros.skip = (this.paginaActual - 1) * this.pageSize;
    this.filtros.limit = this.pageSize;

    this.cargarConsultas(this.filtros);
  }
  mostrar(): void {
    this.visible = !this.visible;
  }

  rowActiva: number | null = null;

  activarFila(id: number) {
    this.rowActiva = this.rowActiva === id ? null : id;
  }



  getCicloStatus(ciclo: Record<string, any>): 'activo' | 'inactivo' {
    if (!ciclo) return 'activo';

    const registros = Object.values(ciclo);
    if (registros.length === 0) return 'activo';

    registros.sort((a: any, b: any) =>
      new Date(b.registro).getTime() - new Date(a.registro).getTime()
    );

    const ultimo = registros[0];
    const encontrado = ciclos.find(c => c.value === ultimo.estado);

    return encontrado?.ref === 'inactivo' ? 'inactivo' : 'activo';
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    const [h, m, s] = hora.split(':');
    const date = new Date();
    date.setHours(+h, +m, +s);
    return date.toTimeString().slice(0, 5);
  }

  hoja(consultaId: number) {
    this.router.navigate(['/coexHoja/', consultaId]);
  }

  // ✅ Métodos helper para obtener totales específicos
  getTotalPacientes(): number {
    return this.totales.find(t =>
      t.entidad.toLowerCase().includes('pacientes totales')
    )?.total || 0;
  }

  getTotalConsultasHoy(): number {
    return this.totales.find(t =>
      t.entidad.toLowerCase().includes('consultas') &&
      t.entidad.toLowerCase().includes('hoy')
    )?.total || 0;
  }

  getTotalCoexHoy(): number {
    return this.totales.find(t =>
      t.entidad.toLowerCase().includes('coex')
    )?.total || 0;
  }


}
