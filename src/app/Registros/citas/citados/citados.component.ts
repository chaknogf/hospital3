import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Citas } from '../../../interface/citas';
import { CitaService } from '../cita.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import {
  addIcon, removeIcon, saveIcon, cancelIcon, findIcon, menuIcon,
  searchIcon, arrowDown, tablaShanonIcon, editIcon, skipRight, skipLeft, printIcon

} from '../../../shared/icons/svg-icon';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { Especialidades, KeyValue } from '../../../enum/especialidades';

@Component({
  selector: 'app-citados',
  templateUrl: './citados.component.html',
  styleUrls: ['./citados.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe]
})
export class CitadosComponent implements OnInit {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CitaService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private hoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }



  // ======= ESTADO =======
  citas: Citas[] = [];
  citasFiltradas: Citas[] = [];
  especialidadesList: KeyValue[] = Especialidades;
  citaSeleccionada: Citas | null = null;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  finPagina: boolean = false;
  rowActiva: number | null = null;

  // ======= FILTROS =======
  filtros: any = {
    expediente: '',
    especialidad: '',
    fecha_cita: this.hoy(),
    limit: 200,
  };

  //======== ICONOS ======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  searchIcon!: SafeHtml;
  arrowDown!: SafeHtml;
  tablaShanonIcon!: SafeHtml;
  editIcon!: SafeHtml;
  skipRight!: SafeHtml;
  skipLeft!: SafeHtml;
  printIcon!: SafeHtml;
  menuIcon!: SafeHtml;


  filtroForm: FormGroup = this.fb.group({
    expediente: [''],
    especialidad: [''],
    fecha: [''],
  });

  constructor() {
    this.inicializarIconos();
  }

  // ======= CICLO DE VIDA =======
  ngOnInit(): void {
    this.api.citas$.subscribe(data => {
      this.citas = data;
      this.citasFiltradas = data;
      this.cargando = false;
    });

    this.cargarCitas();
  }

  private inicializarIconos(): void {
    this.addIcon = this.sanitizer.bypassSecurityTrustHtml(addIcon);
    this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(removeIcon);
    this.menuIcon = this.sanitizer.bypassSecurityTrustHtml(menuIcon);
    this.cancelIcon = this.sanitizer.bypassSecurityTrustHtml(cancelIcon);
    this.findIcon = this.sanitizer.bypassSecurityTrustHtml(findIcon);
    this.searchIcon = this.sanitizer.bypassSecurityTrustHtml(searchIcon);
    this.arrowDown = this.sanitizer.bypassSecurityTrustHtml(arrowDown);
    this.tablaShanonIcon = this.sanitizer.bypassSecurityTrustHtml(tablaShanonIcon);
    this.editIcon = this.sanitizer.bypassSecurityTrustHtml(editIcon);
    this.skipLeft = this.sanitizer.bypassSecurityTrustHtml(skipLeft);
    this.skipRight = this.sanitizer.bypassSecurityTrustHtml(skipRight);
    this.printIcon = this.sanitizer.bypassSecurityTrustHtml(printIcon);

  }

  // ======= CARGA DE DATOS =======
  cargarCitas(): void {
    this.cargando = false;
    // console.log(this.filtros)
    this.api.getCitas(this.filtros).subscribe((data) => {
      this.citas = data;
    })


  }

  limpiarFiltros(): void {
    this.filtros = {
      expediente: '',
      especialidad: '',
      fecha_cita: this.hoy(),
      limit: 200,
    }
    this.cargarCitas();
  }


  toggleFiltros(): void {
    this.filtrar = !this.filtrar;
  }

  // ======= SELECCIÓN / DETALLE =======
  verDetalle(id: number): void {

    this.visible = true;
  }

  cerrarDetalle(): void {
    this.citaSeleccionada = null;
    this.visible = false;
  }


  editarCita(id: number): void {

    this.router.navigate(['/reagendar/cita', id]);
  }



  // ======= UTILIDADES =======
  trackById(_index: number, cita: Citas): number {
    return cita.id;
  }

  get totalCitas(): number {
    return this.citasFiltradas.length;
  }

  volver() {
    this.location.back();
  }

  imprimirCitas(): void {
    this.router.navigate(['/imprimirCitas']);
  }

}
