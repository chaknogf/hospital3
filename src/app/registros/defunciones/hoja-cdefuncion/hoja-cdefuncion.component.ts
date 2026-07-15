import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { DefuncionesService } from '../defunciones.service';
import { DefuncionOut } from '../../../interface/consDef';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';

@Component({
  selector: 'app-hoja-cdefuncion',
  standalone: true,
  templateUrl: './hoja-cdefuncion.component.html',
  styleUrls: ['./hoja-cdefuncion.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, CapitalizePipe]
})
export class HojaCdefuncionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(DefuncionesService);

  defuncion = signal<DefuncionOut | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | null>(null);
  detalleVisible = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.cargarDatos(id);
    } else {
      this.error.set('ID de defunción inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatos(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.getDefuncion(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false)),
      catchError(error => {
        console.error('Error cargando defunción:', error);
        this.error.set('Error al cargar la defunción');
        this.detalleVisible.set(true);
        return of(null);
      })
    ).subscribe(data => {
      if (!data) {
        this.error.set('Defunción no encontrada');
        this.detalleVisible.set(true);
        return;
      }
      this.defuncion.set(data);
      this.detalleVisible.set(true);
    });
  }

  imprimir(): void {
    setTimeout(() => window.print(), 100);
  }

  regresar(): void {
    this.router.navigate(['/defunciones']);
  }

  get nombreFallecido(): string {
    const p = this.defuncion()?.paciente;
    if (!p?.nombre) return p?.nombre_completo ?? '—';
    const n = p.nombre;
    return [n['primer_nombre'], n['segundo_nombre'], n['otro_nombre'], n['primer_apellido'], n['segundo_apellido'], n['apellido_casada']].filter(Boolean).join(' ');
  }

  get nombreMadre(): string {
    const m = this.defuncion()?.madre;
    if (!m?.nombre) return m?.nombre_completo ?? '—';
    const n = m.nombre;
    return [n['primer_nombre'], n['segundo_nombre'], n['otro_nombre'], n['primer_apellido'], n['segundo_apellido'], n['apellido_casada']].filter(Boolean).join(' ');
  }
}
