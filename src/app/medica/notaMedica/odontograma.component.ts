import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DenticionDental, Odontograma, SuperficieDental } from './odontograma.model';

/** Permite visualizar y actualizar las superficies y condiciones dentales. */
@Component({
  selector: 'app-odontograma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './odontograma.component.html',
  styleUrl: './odontograma.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontogramaComponent {
  @Input({ required: true }) value!: Odontograma;
  @Output() valueChange = new EventEmitter<Odontograma>();

  readonly superficies: { key: SuperficieDental; label: string; short: string }[] = [
    { key: 'vestibular', label: 'Vestibular', short: 'V' },
    { key: 'mesial', label: 'Mesial', short: 'M' },
    { key: 'oclusal', label: 'Oclusal', short: 'O' },
    { key: 'distal', label: 'Distal', short: 'D' },
    { key: 'lingual', label: 'Lingual / palatina', short: 'L' },
  ];

  readonly hallazgos = [
    { value: 'sano', label: 'Limpiar', color: 'neutral' },
    { value: 'caries', label: 'Caries', color: 'caries' },
    { value: 'resina', label: 'Resina', color: 'resina' },
    { value: 'amalgama', label: 'Amalgama', color: 'amalgama' },
    { value: 'sellante', label: 'Sellante', color: 'sellante' },
    { value: 'corona', label: 'Corona', color: 'corona' },
    { value: 'endodoncia', label: 'Endodoncia', color: 'endodoncia' },
    { value: 'ausente', label: 'Ausente / extracción', color: 'ausente' },
    { value: 'implante', label: 'Implante', color: 'implante' },
  ];

  readonly cuadrantes = [
    { nombre: 'Superior derecho', clase: 'superior-derecho', dientesPermanentes: this.rango(18, 11), dientesTemporales: this.rango(55, 51) },
    { nombre: 'Superior izquierdo', clase: 'superior-izquierdo', dientesPermanentes: this.rango(21, 28), dientesTemporales: this.rango(61, 65) },
    { nombre: 'Inferior derecho', clase: 'inferior-derecho', dientesPermanentes: this.rango(48, 41), dientesTemporales: this.rango(85, 81) },
    { nombre: 'Inferior izquierdo', clase: 'inferior-izquierdo', dientesPermanentes: this.rango(31, 38), dientesTemporales: this.rango(71, 75) },
  ];

  denticion: DenticionDental = 'permanente';
  hallazgoActivo = 'caries';

  cambiarDenticion(denticion: DenticionDental): void {
    this.denticion = denticion;
    this.emitir({ ...this.value, denticion });
  }

  dientesDelCuadrante(cuadrante: (typeof this.cuadrantes)[number]): number[] {
    return this.denticion === 'permanente' ? cuadrante.dientesPermanentes : cuadrante.dientesTemporales;
  }

  marcarPieza(numero: number): void {
    const dientes = { ...this.value.dientes };
    if (this.hallazgoActivo === 'sano') {
      delete dientes[numero];
    } else if (this.hallazgoActivo === 'ausente') {
      dientes[numero] = { estado: 'ausente', superficies: {} };
    } else {
      dientes[numero] = { ...dientes[numero], estado: this.hallazgoActivo };
    }
    this.emitir({ ...this.value, dientes });
  }

  marcarSuperficie(numero: number, superficie: SuperficieDental): void {
    const dientes = { ...this.value.dientes };
    const pieza = { ...dientes[numero], superficies: { ...dientes[numero]?.superficies } };
    if (this.hallazgoActivo === 'sano') {
      delete pieza.superficies?.[superficie];
      if (!pieza.estado && !Object.keys(pieza.superficies ?? {}).length) delete dientes[numero];
      else dientes[numero] = pieza;
    } else {
      if (pieza.estado === 'ausente') pieza.estado = undefined;
      pieza.superficies![superficie] = this.hallazgoActivo;
      dientes[numero] = pieza;
    }
    this.emitir({ ...this.value, dientes });
  }

  estadoSuperficie(numero: number, superficie: SuperficieDental): string {
    return this.value.dientes[numero]?.superficies?.[superficie]
      ?? this.value.dientes[numero]?.estado
      ?? 'sano';
  }

  limpiar(): void {
    this.emitir({ ...this.value, dientes: {} });
  }

  private rango(desde: number, hasta: number): number[] {
    const paso = desde <= hasta ? 1 : -1;
    return Array.from({ length: Math.abs(hasta - desde) + 1 }, (_, index) => desde + index * paso);
  }

  private emitir(value: Odontograma): void {
    this.valueChange.emit(value);
  }
}
