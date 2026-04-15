import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaResponse, Citas } from '../../../interface/citas';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  addIcon, removeIcon, saveIcon, cancelIcon, findIcon, menuIcon,
  searchIcon, arrowDown, tablaShanonIcon, editIcon, skipRight, skipLeft
  
} from '../../../shared/icons/svg-icon';

@Component({
  selector: 'app-citados',
  templateUrl: './citados.component.html',
  styleUrls: ['./citados.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CitadosComponent implements OnInit {
  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

 

  // ======= ESTADO =======
  citas: Citas[] = [];
  citasFiltradas: Citas[] = [];
  citaSeleccionada: Citas | null = null;
  cargando = false;
  filtrar = false;
  visible = false;
  modalActivo = false;
  finPagina: boolean = false;
  rowActiva: number | null = null;

  // ======= FILTROS =======
  filtros: any = {
    id: 0,
    expediente: '',
    paciente_id: 0,
    especialidad: '',
    fecha_cita: '',
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
    this.skipRight = this.sanitizer.bypassSecurityTrustHtml(skipLeft);

  }

  // ======= CARGA DE DATOS =======
  cargarCitas(): void {
    this.cargando = true;
    console.log(this.filtros)
    this.api.getCitas(this.filtros).subscribe({
      next: resultado => {
        this.citas = resultado.citas;
      }
    })

 
  }

  limpiarFiltros(): void {
    this.filtros = {
    id: 0,
    expediente: '',
    paciente_id: 0,
    especialidad: '',
    fecha_cita: '',
    limit: 200,
    }
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

  // ======= NAVEGACIÓN =======
  nuevaCita(): void {
    this.router.navigate(['agendar'])
  }

  editarCita(id: number): void {
    this.router.navigate(['agendar', id]);
  }

  // ======= ELIMINACIÓN =======
  // eliminarCita(id: number): void {
  //   if (!confirm('¿Está seguro de eliminar esta cita?')) return;

  //   this.api.deleteCita(id).subscribe({
  //     next: () => {
  //       this.citas = this.citas.filter((c) => c.id !== id);
  //       this.citasFiltradas = this.citasFiltradas.filter((c) => c.id !== id);
  //       if (this.citaSeleccionada?.id === id) this.cerrarDetalle();
  //     },
  //     error: (error) => console.error('Error al eliminar cita:', error),
  //   });
  // }

  // ======= UTILIDADES =======
  trackById(_index: number, cita: Citas): number {
    return cita.id;
  }

  get totalCitas(): number {
    return this.citasFiltradas.length;
  }

   volver() {
    this.router.navigate(['/registros']);
  }

  
}
