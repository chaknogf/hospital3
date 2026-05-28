import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy, inject, signal, input } from '@angular/core';
import { ConstanciasService } from '../constancias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstanciaNacimiento } from '../constancias.inteface';
import { DatosExtraPipe } from '../../../pipes/datos-extra.pipe';
import { TimePipe } from '../../../pipes/time.pipe';
import { APipe, EdadPipe } from '../../../pipes/edad.pipe';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { CuiPipe } from '../../../pipes/cui.pipe';
import { ApiService } from '../../../service/api.service';

@Component({
  selector: 'app-hoja-cnacimiento',
  standalone: true,
  templateUrl: './hoja-cnacimiento.component.html',
  styleUrls: ['./hoja-cnacimiento.component.css'],
  imports: [CommonModule, DatosExtraPipe, TimePipe, APipe, CuiPipe]
})
export class HojaCnacimientoComponent implements OnInit, OnDestroy {

  // ======= INYECCIONES =======
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ConstanciasService);
  private apis = inject(ApiService);

  // ======= SIGNALS =======
  constancia = signal<ConstanciaNacimiento | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | null>(null);
  detalleVisible = signal(false);
  // Nombre del usuario actual
  responsable = this.apis.nombreUsuario;


  // ======= CONTROL DE VIDA =======
  private destroy$ = new Subject<void>();

  // ======= INIT =======
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.cargarDatos(id);
    } else {
      this.error.set('ID de constancia inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= CARGA DE DATOS =======
  private cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getConstancia(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(error => {
          console.error('❌ Error cargando constancia:', error);
          this.error.set('Error al cargar la constancia');
          this.detalleVisible.set(true);
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data) {
          this.error.set('Constancia no encontrada');
          this.detalleVisible.set(true);
          return;
        }

        this.constancia.set(data);
        this.detalleVisible.set(true); // 🔥 CLAVE
      });
  }

  // ======= ACCIONES =======
  imprimir(): void {
    setTimeout(() => window.print(), 100);
  }

  regresar(): void {
    this.router.navigate(['/nacimientos']);
  }

  private claseParto(): string {
    return this.constancia()
      ?.paciente
      ?.datos_extra
      ?.neonatales
      ?.clase_parto ?? '';
  }

  get pes(): boolean {
    return this.claseParto().includes('Pes');
  }

  get cstp(): boolean {
    return this.claseParto().includes('Cstp');
  }



}
