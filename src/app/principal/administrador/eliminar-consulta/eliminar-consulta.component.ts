import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ConsultaService } from '../../../service/axios.service';

@Component({
  selector: 'app-eliminar-consulta',
  templateUrl: './eliminar-consulta.component.html',
  styleUrls: ['./eliminar-consulta.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class EliminarConsultaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaAxios = inject(ConsultaService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  form: FormGroup;

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit() {}

  private crearFormulario(): FormGroup {
    return this.fb.group({
      consulta_id: ['']
    });
  }

  async eliminar(): Promise<void> {
    if (this.form.invalid) return;

    const consulta_id = Number(this.form.get('consulta_id')?.value);

    if (!consulta_id) {
      this.error.set('Ingresa el ID de la consulta');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(true);

    try {
      const response = await this.consultaAxios.deleteConsulta(consulta_id);
      this.success.set('Consulta eliminada exitosamente');
      this.form.reset();
    } catch (err) {
      console.error('error al eliminar: ', err);
      this.error.set('Error al eliminar consulta');
    } finally {
      this.isLoading.set(false);
    }
  }

  volver(): void {
    this.router.navigate(['/adminsys']);
  }
}
