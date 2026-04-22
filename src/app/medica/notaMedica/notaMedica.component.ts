import { Component, OnInit, signal, computed, inject } from '@angular/core';
import {
  CicloConsulta,
  DatoMedico,
  SignosVitales,
  Antecedentes,
  Cuerpo,
  Glasgow,
  Silverman,
  Downe,
  Apgar,
  Bishop,
  Egreso,
  Dx,
} from '../../interface/ciclo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosExtraPipe } from '../../pipes/datos-extra.pipe';
import { EdadPipe } from '../../pipes/edad.pipe';
import { Router } from '@angular/router';
import { IconService } from '../../service/icon.service';
import { ConsultaService } from '../ciclo.service';

@Component({
  selector: 'app-notaMedica',
  templateUrl: './notaMedica.component.html',
  styleUrls: ['./notaMedica.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatosExtraPipe]
})
export class NotaMedicaComponent implements OnInit {

  private api = inject(ConsultaService);
  private router = inject(Router);
  private iconService = inject(IconService);

  /* ── Signals ─────────────────────────────────────────── */
  ciclo = signal<CicloConsulta | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  /* ── UI state ─────────────────────────────────────────── */
  tabActivo: string = 'clinica';
  escalaActiva: string = 'glasgow';
  horaSignos: string = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

  antecedentesAbiertos: Record<string, boolean> = {};

  /* ── Datos médicos ─────────────────────────────────────── */
  datosMedicos: DatoMedico = {
    detalle_clinicos: '',
    ordenes: '',
    estudios: '',
    comentario: '',
    impresion_clinica: '',
    tratamiento: '',
    contraindicado: '',
  };

  signosVitales: SignosVitales = {
    pa: '', fc: '', fr: '', sat02: '', temp: '',
    peso: '', talla: '', pt: '', te: '', pe: '', gmt: '',
  };

  antecedentes: Antecedentes = {
    familiares: [],
    medicos: [],
    quirurgicos: [],
    alergicos: [],
    traumaticos: [],
    ginecoobstetricos: [],
    habitos: [],
  };

  // 👉 Datos reales del paciente
  cuerpo: Cuerpo = {
    cabeza: '', ojos: '', oidos: '', nariz: '', boca: '',
    cuello: '', torax: '', pulmones: '', corazon: '', abdomen: '',
    genitales: '', extremidades: '', columna: '', piel: '', neurologico: '',
  };

  // 👉 Configuración del formulario
  segmentosCuerpo: { key: keyof Cuerpo; label: string }[] = [
    { key: 'cabeza', label: 'Cabeza' },
    { key: 'ojos', label: 'Ojos' },
    { key: 'oidos', label: 'Oídos' },
    { key: 'nariz', label: 'Nariz' },
    { key: 'boca', label: 'Boca' },
    { key: 'cuello', label: 'Cuello' },
    { key: 'torax', label: 'Tórax' },
    { key: 'pulmones', label: 'Pulmones' },
    { key: 'corazon', label: 'Corazón' },
    { key: 'abdomen', label: 'Abdomen' },
    { key: 'genitales', label: 'Genitales' },
    { key: 'extremidades', label: 'Extremidades' },
    { key: 'columna', label: 'Columna' },
    { key: 'piel', label: 'Piel' },
    { key: 'neurologico', label: 'Neurológico' },
  ];

  glasgow: Glasgow = {
    apertura_ocular: 4,
    respuesta_verbal: 5,
    respuesta_motora: 6,
    puntuacion_total: 15,
  };

  silverman: Silverman = {
    retraso_esternal: 0,
    aleteo_nasal: 0,
    quejido_expiratorio: 0,
    movimiento_toracico: 0,
    retraccion_supraclavicular: 0,
    puntuacion_total: 0,
  };

  downe: Downe = {
    frecuencia_respiratoria: 0,
    aleteo_nasal: 0,
    quejido_respiratorio: 0,
    retraccion_toracoabdominal: 0,
    cinoasis: 0,
    puntuacion_total: 0,
  };

  apgar: Apgar = {
    tono_muscular: 2,
    respuesta_refleja: 2,
    llanto: 2,
    respiracion: 2,
    coloracion: 2,
    puntuacion_total: 10,
    interpretacion: 'Normal',
  };

  bishop: Bishop = {
    dilatacion: 0,
    borramiento: 0,
    posicion: 0,
    consistencia: 0,
    altura_presentacion: 0,
    puntuacion_total: 0,
  };

  egreso: Egreso = {
    condicion: '',
    referencia: '',
    medico: '',
    diagnosticos: [],
  };

  /* ── Metadatos de formulario ───────────────────────────── */
  gruposAntecedentes = [
    { key: 'familiares', label: 'Familiares', icon: '👨‍👩‍👧' },
    { key: 'medicos', label: 'Médicos', icon: '🏥' },
    { key: 'quirurgicos', label: 'Quirúrgicos', icon: '🔪' },
    { key: 'alergicos', label: 'Alérgicos', icon: '⚠️' },
    { key: 'traumaticos', label: 'Traumáticos', icon: '🦴' },
    { key: 'ginecoobstetricos', label: 'Gineco-Obstétricos', icon: '🤰' },
    { key: 'habitos', label: 'Hábitos', icon: '🚬' },
  ];

  // segmentosCuerpo = [
  //   { key: 'cabeza', label: 'Cabeza' },
  //   { key: 'ojos', label: 'Ojos' },
  //   { key: 'oidos', label: 'Oídos' },
  //   { key: 'nariz', label: 'Nariz' },
  //   { key: 'boca', label: 'Boca' },
  //   { key: 'cuello', label: 'Cuello' },
  //   { key: 'torax', label: 'Tórax' },
  //   { key: 'pulmones', label: 'Pulmones' },
  //   { key: 'corazon', label: 'Corazón' },
  //   { key: 'abdomen', label: 'Abdomen' },
  //   { key: 'genitales', label: 'Genitales' },
  //   { key: 'extremidades', label: 'Extremidades' },
  //   { key: 'columna', label: 'Columna' },
  //   { key: 'piel', label: 'Piel' },
  //   { key: 'neurologico', label: 'Neurológico' },
  // ];

  glasgowFields = [
    { key: 'apertura_ocular', label: 'Apertura Ocular', min: 1, max: 4, hint: '1-4' },
    { key: 'respuesta_verbal', label: 'Respuesta Verbal', min: 1, max: 5, hint: '1-5' },
    { key: 'respuesta_motora', label: 'Respuesta Motora', min: 1, max: 6, hint: '1-6' },
  ];

  silvermanFields = [
    { key: 'retraso_esternal', label: 'Retraso Esternal' },
    { key: 'aleteo_nasal', label: 'Aleteo Nasal' },
    { key: 'quejido_expiratorio', label: 'Quejido Expiratorio' },
    { key: 'movimiento_toracico', label: 'Mov. Torácico' },
    { key: 'retraccion_supraclavicular', label: 'Retr. Supraclavicular' },
  ];

  downeFields = [
    { key: 'frecuencia_respiratoria', label: 'Frec. Respiratoria', max: 2 },
    { key: 'aleteo_nasal', label: 'Aleteo Nasal', max: 2 },
    { key: 'quejido_respiratorio', label: 'Quejido Respiratorio', max: 2 },
    { key: 'retraccion_toracoabdominal', label: 'Retr. Toracoabdominal', max: 2 },
    { key: 'cinoasis', label: 'Cianosis', max: 2 },
  ];

  apgarFields = [
    { key: 'tono_muscular', label: 'Tono Muscular' },
    { key: 'respuesta_refleja', label: 'Resp. Refleja' },
    { key: 'llanto', label: 'Llanto' },
    { key: 'respiracion', label: 'Respiración' },
    { key: 'coloracion', label: 'Coloración' },
  ];

  bishopFields = [
    { key: 'dilatacion', label: 'Dilatación', min: 0, max: 3 },
    { key: 'borramiento', label: 'Borramiento', min: 0, max: 3 },
    { key: 'posicion', label: 'Posición', min: 0, max: 2 },
    { key: 'consistencia', label: 'Consistencia', min: 0, max: 2 },
    { key: 'altura_presentacion', label: 'Altura Present.', min: 0, max: 3 },
  ];

  /* ── Totales computados ────────────────────────────────── */
  get glasgowTotal(): number {
    return (this.glasgow.apertura_ocular || 0)
      + (this.glasgow.respuesta_verbal || 0)
      + (this.glasgow.respuesta_motora || 0);
  }

  get silvermanTotal(): number {
    return (this.silverman.retraso_esternal || 0)
      + (this.silverman.aleteo_nasal || 0)
      + (this.silverman.quejido_expiratorio || 0)
      + (this.silverman.movimiento_toracico || 0)
      + (this.silverman.retraccion_supraclavicular || 0);
  }

  get downeTotal(): number {
    return (this.downe.frecuencia_respiratoria || 0)
      + (this.downe.aleteo_nasal || 0)
      + (this.downe.quejido_respiratorio || 0)
      + (this.downe.retraccion_toracoabdominal || 0)
      + (this.downe.cinoasis || 0);
  }

  get apgarTotal(): number {
    return (this.apgar.tono_muscular || 0)
      + (this.apgar.respuesta_refleja || 0)
      + (this.apgar.llanto || 0)
      + (this.apgar.respiracion || 0)
      + (this.apgar.coloracion || 0);
  }

  get bishopTotal(): number {
    return (this.bishop.dilatacion || 0)
      + (this.bishop.borramiento || 0)
      + (this.bishop.posicion || 0)
      + (this.bishop.consistencia || 0)
      + (this.bishop.altura_presentacion || 0);
  }

  /* ── Lifecycle ─────────────────────────────────────────── */
  constructor() { }

  ngOnInit(): void {
    this.cargarDatos();
    this.gruposAntecedentes.forEach(g => {
      this.antecedentesAbiertos[g.key] = false;
    });
  }

  cargarDatos(): void {
    // TODO: inyectar servicio y cargar ciclo por ID desde la ruta
    // const id = this.route.snapshot.paramMap.get('id');
    // this.isLoading.set(true);
    // this.cicloService.getCiclo(id).subscribe({
    //   next: (c) => { this.ciclo.set(c); this.mapearDatos(c); this.isLoading.set(false); },
    //   error: (e) => { this.error.set(e.message); this.isLoading.set(false); }
    // });
  }

  mapearDatos(ciclo: CicloConsulta): void {
    const dm = ciclo.datos_medicos;
    if (!dm) return;

    if (dm.detalle_clinicos) this.datosMedicos.detalle_clinicos = dm.detalle_clinicos;
    if (dm.impresion_clinica) this.datosMedicos.impresion_clinica = dm.impresion_clinica;
    if (dm.tratamiento) this.datosMedicos.tratamiento = dm.tratamiento;
    if (dm.ordenes) this.datosMedicos.ordenes = dm.ordenes;
    if (dm.estudios) this.datosMedicos.estudios = dm.estudios;
    if (dm.comentario) this.datosMedicos.comentario = dm.comentario;
    if (dm.contraindicado) this.datosMedicos.contraindicado = dm.contraindicado;

    if (dm.signos_vitales) this.signosVitales = { ...dm.signos_vitales };
    if (dm.antecedentes) this.antecedentes = { ...dm.antecedentes };
    if (dm.egreso) this.egreso = { ...dm.egreso, diagnosticos: dm.egreso.diagnosticos ?? [] };

    if (dm.examen_fisico) {
      const ef = dm.examen_fisico;
      const lastKey = (obj: any) => obj ? Object.keys(obj).pop() : null;

      const cuerpoKey = lastKey(ef.cuerpo);
      if (cuerpoKey && ef.cuerpo[cuerpoKey]) this.cuerpo = { ...ef.cuerpo[cuerpoKey] };

      const glasgowKey = lastKey(ef.glasgow);
      if (glasgowKey && ef.glasgow[glasgowKey]) this.glasgow = { ...ef.glasgow[glasgowKey] };

      const silvermanKey = lastKey(ef.silverman);
      if (silvermanKey && ef.silverman[silvermanKey]) this.silverman = { ...ef.silverman[silvermanKey] };

      const downeKey = lastKey(ef.downe);
      if (downeKey && ef.downe[downeKey]) this.downe = { ...ef.downe[downeKey] };

      const apgarKey = lastKey(ef.apgar);
      if (apgarKey && ef.apgar[apgarKey]) this.apgar = { ...ef.apgar[apgarKey] };

      const bishopKey = lastKey(ef.bishop);
      if (bishopKey && ef.bishop[bishopKey]) this.bishop = { ...ef.bishop[bishopKey] };
    }
  }

  /* ── Acciones UI ───────────────────────────────────────── */
  setTab(tab: string): void {
    this.tabActivo = tab;
  }

  toggleAntecedente(key: string): void {
    this.antecedentesAbiertos[key] = !this.antecedentesAbiertos[key];
  }

  getAntecedentes(key: string): any[] {
    return (this.antecedentes as any)[key] ?? [];
  }

  agregarAntecedente(key: string): void {
    (this.antecedentes as any)[key].push({ descripcion: '' });
  }

  eliminarAntecedente(key: string, index: number): void {
    (this.antecedentes as any)[key].splice(index, 1);
  }

  agregarDx(): void {
    if (!this.egreso.diagnosticos) this.egreso.diagnosticos = [];
    this.egreso.diagnosticos.push({ codigo: '', descripcion: '' });
  }

  eliminarDx(index: number): void {
    this.egreso.diagnosticos?.splice(index, 1);
  }

  /* ── Helpers matemáticos ────────────────────────────────── */
  min = Math.min;
  max = Math.max;

  /* ── Interpretaciones ───────────────────────────────────── */
  interpretarGlasgow(): string {
    const t = this.glasgowTotal;
    if (t >= 13) return 'Leve / Normal';
    if (t >= 9) return 'Moderado';
    return 'Grave';
  }

  interpretarSilverman(): string {
    const t = this.silvermanTotal;
    if (t === 0) return 'Sin dificultad';
    if (t <= 3) return 'Dificultad leve';
    if (t <= 6) return 'Dificultad moderada';
    return 'Dificultad grave';
  }

  interpretarDowne(): string {
    const t = this.downeTotal;
    if (t <= 3) return 'Dificultad leve';
    if (t <= 6) return 'Dificultad moderada';
    return 'Dificultad grave';
  }

  interpretarApgar(): string {
    const t = this.apgarTotal;
    if (t >= 7) return 'Normal';
    if (t >= 4) return 'Depresión moderada';
    return 'Depresión grave';
  }

  interpretarBishop(): string {
    const t = this.bishopTotal;
    if (t >= 8) return 'Favorable para inducción';
    if (t >= 6) return 'Moderadamente favorable';
    return 'Desfavorable';
  }

  /* ── Guardar ────────────────────────────────────────────── */
  guardar(): void {
    const ahora = new Date().toISOString();

    const datosMedicos: DatoMedico = {
      ...this.datosMedicos,
      signos_vitales: { ...this.signosVitales },
      antecedentes: { ...this.antecedentes },
      egreso: { ...this.egreso },
      examen_fisico: {
        cuerpo: { [ahora]: { ...this.cuerpo } },
        glasgow: { [ahora]: { ...this.glasgow, puntuacion_total: this.glasgowTotal } },
        silverman: { [ahora]: { ...this.silverman, puntuacion_total: this.silvermanTotal } },
        downe: { [ahora]: { ...this.downe, puntuacion_total: this.downeTotal } },
        apgar: { [ahora]: { ...this.apgar, puntuacion_total: this.apgarTotal, interpretacion: this.interpretarApgar() } },
        bishop: { [ahora]: { ...this.bishop, puntuacion_total: this.bishopTotal } },
      },
    };

    console.log('[NotaMedica] Payload a guardar:', datosMedicos);
    // TODO: this.cicloService.guardarDatos(this.ciclo()!.id!, datosMedicos).subscribe(...)
  }

  regresar(): void {
    this.router.navigate(['/pacientesAtendidos'])
  }

  editar(id: number | undefined): void {
    // TODO: this.router.navigate(['/consultas', id, 'editar']);
    console.log('[NotaMedica] Editar ciclo', id);
  }
}
