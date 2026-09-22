import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { CicloService } from '../ciclo.service';
import { CicloConsulta, DatoMedico, SignosVitales, ExamenFisico, Cuerpo, Glasgow, Silverman, Downe, Apgar, Bishop, Egreso, Dx } from '../../interface/ciclo';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';

interface GrupoAnt { key: keyof NonNullable<DatoMedico['antecedentes']>; label: string; }

@Component({
  selector: 'app-verNotaMedica',
  templateUrl: './verNotaMedica.component.html',
  styleUrls: ['./verNotaMedica.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatosExtraPipe],
})
export class VerNotaMedicaComponent implements OnInit, OnDestroy {
  private api = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ciclo = signal<CicloConsulta | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  readonly generadoEn = new Date();

  readonly gruposAnt: GrupoAnt[] = [
    { key: 'familiares', label: 'Familiares' },
    { key: 'medicos', label: 'Médicos' },
    { key: 'quirurgicos', label: 'Quirúrgicos' },
    { key: 'alergicos', label: 'Alergias' },
    { key: 'traumaticos', label: 'Traumáticos' },
    { key: 'ginecoobstetricos', label: 'Gineco-obstétricos' },
    { key: 'habitos', label: 'Hábitos' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.cargando.set(false);
      this.error.set('No se indicó la nota a mostrar.');
      return;
    }
    this.api.getCiclo(id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.error.set(err?.error?.detail ?? 'No se pudo cargar la nota médica.');
        return of(null);
      })
    ).subscribe(c => {
      this.ciclo.set(c);
      this.cargando.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get datos(): DatoMedico | null { return this.ciclo()?.datos_medicos ?? null; }

  /** Nombre completo del paciente (compuesto desde el objeto nombre). */
  get nombrePaciente(): string {
    const p = this.ciclo()?.consulta?.paciente as any;
    if (!p) return this.ciclo()?.consulta?.expediente ?? 'Paciente';
    const n = p.nombre ?? {};
    const full = [n.primer_nombre, n.segundo_nombre, n.primer_apellido, n.segundo_apellido]
      .filter(Boolean).join(' ');
    return p.nombre_completo || full || p.expediente || this.ciclo()?.consulta?.expediente || 'Paciente';
  }
  get signos(): SignosVitales | null { return this.datos?.signos_vitales ?? null; }
  get examen(): ExamenFisico | null { return this.datos?.examen_fisico ?? null; }
  get egreso(): Egreso | null { return this.datos?.egreso ?? null; }

  /** Última entrada de un mapa indexado por timestamp. */
  ultimo<T>(mapa?: Record<string, T>): T | null {
    if (!mapa) return null;
    const keys = Object.keys(mapa);
    return keys.length ? mapa[keys[keys.length - 1]] : null;
  }
  get cuerpo(): Cuerpo | null { return this.ultimo(this.examen?.cuerpo) ?? null; }
  get glasgow(): Glasgow | null { return this.ultimo(this.examen?.glasgow) ?? null; }
  get silverman(): Silverman | null { return this.ultimo(this.examen?.silverman) ?? null; }
  get downe(): Downe | null { return this.ultimo(this.examen?.downe) ?? null; }
  get apgar(): Apgar | null { return this.ultimo(this.examen?.apgar) ?? null; }
  get bishop(): Bishop | null { return this.ultimo(this.examen?.bishop) ?? null; }

  /** Lista de diagnósticos del egreso (soporta array o string). */
  get diagnosticos(): Dx[] {
    const d = this.egreso?.diagnosticos as any;
    if (Array.isArray(d)) return d.filter((x: Dx) => x?.codigo || x?.descripcion);
    if (typeof d === 'string' && d.trim()) return [{ codigo: '', descripcion: d }];
    return [];
  }

  /** Pares etiqueta→valor de signos vitales (solo los que tienen dato). */
  get signosItems(): { label: string; valor: string }[] {
    const s = this.signos;
    if (!s) return [];
    const items = [
      { label: 'PA (mmHg)', valor: s.pa }, { label: 'FC (lpm)', valor: s.fc },
      { label: 'FR (rpm)', valor: s.fr }, { label: 'SatO₂ (%)', valor: s.sat02 },
      { label: 'Temp (°C)', valor: s.temp }, { label: 'Peso (kg)', valor: s.peso },
      { label: 'Talla (cm)', valor: s.talla }, { label: 'Perim. cefálico', valor: s.pt },
      { label: 'T. edad gest.', valor: s.te }, { label: 'P. edad gest.', valor: s.pe },
      { label: 'GMT', valor: s.gmt },
    ];
    return items.filter(i => i.valor && String(i.valor).trim());
  }

  /** Hallazgos del examen físico (solo los que tienen dato). */
  get cuerpoItems(): { label: string; valor: string }[] {
    const c = this.cuerpo as any;
    if (!c) return [];
    const labels: Record<string, string> = {
      cabeza: 'Cabeza', ojos: 'Ojos', oidos: 'Oídos', nariz: 'Nariz', boca: 'Boca', cuello: 'Cuello',
      torax: 'Tórax', pulmones: 'Pulmones', corazon: 'Corazón', abdomen: 'Abdomen', genitales: 'Genitales',
      extremidades: 'Extremidades', columna: 'Columna', piel: 'Piel', neurologico: 'Neurológico',
    };
    return Object.keys(labels)
      .map(k => ({ label: labels[k], valor: c[k] }))
      .filter(i => i.valor && String(i.valor).trim());
  }

  /** Grupos de antecedentes con contenido. */
  get antecedentesGrupos(): { label: string; items: { descripcion: string }[] }[] {
    const a = this.datos?.antecedentes as any;
    if (!a) return [];
    return this.gruposAnt
      .map(g => ({ label: g.label, items: (a[g.key] ?? []).filter((x: any) => x?.descripcion?.trim()) }))
      .filter(g => g.items.length);
  }

  imprimir(): void { window.print(); }
  volver(): void {
    const consultaId = this.ciclo()?.consulta_id;
    const pacienteId = this.ciclo()?.consulta?.paciente?.id;
    if (pacienteId) this.router.navigate(['/historiaClinica', pacienteId], { queryParams: { by: 'paciente' } });
    else if (consultaId) this.router.navigate(['/historiaClinica', consultaId]);
    else this.router.navigate(['/pacientesActivos']);
  }
}
