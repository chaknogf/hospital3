import { roles } from './../../../enum/roles.enum';
import { of } from 'rxjs';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario, UsuarioOut } from '../../../interface/usuarios.interface';
import { catchError, finalize, takeUntil } from 'rxjs';
import { addIcon, removeIcon, menuIcon, cancelIcon, findIcon, searchIcon, arrowDown, tablaShanonIcon, editIcon, skipLeft } from '../../../shared/icons/svg-icon';
import { Subject } from 'rxjs';
import { Values } from './../../../enum/roles.enum';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,]
})

export class UsuarioComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  form: FormGroup;
  private destroy$ = new Subject<void>();

  usuario: Usuario | null = null;
  rol: Values[] = roles;

  // ======= SEÑALES =======
  enEdicion = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);


  // ======= ICONOS SVG =======
  addIcon!: SafeHtml;
  removeIcon!: SafeHtml;
  saveIcon!: SafeHtml;
  cancelIcon!: SafeHtml;
  findIcon!: SafeHtml;
  faceidicon!: SafeHtml;
  touchicon!: SafeHtml;

  constructor() {
    this.form = this.crearFormulario();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));

        if (id && !isNaN(id) && id !== 0) {
          this.cargarUsuario(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {
    return this.fb.group({
      id: [''],
      username: [''],
      email: [''],
      role: [''],
      unidad: [287],
      estado: ['A'],
      datos_extra: this.fb.group({
        cui: [''],
        sexo: [''],
        puesto: [''],
        servicio: ['']
      })
    });
  }

  private cargarUsuario(id: number): void {
    this.isLoading.set(true);

    this.api.getUser(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((data: Usuario | null) => {
        if (!data) return;

        this.enEdicion.set(true);

        // 🔥 Normalización
        if (data.datos_extra) {
          data.datos_extra.servicio = (data.datos_extra as any).Servicio ?? '';
        }

        this.form.patchValue(data, { emitEvent: false });
        this.error.set(null);
      });
  }

  guardar(): void {
    if (this.form.invalid) return;

    const data = this.form.value as Usuario;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(id)

    if (this.enEdicion()) {
      this.actualizar(id, data);
    } else {
      // aquí podrías crear usuario
      console.log('crear usuario', data);
    }
  }

  private actualizar(id: number, usuario: Usuario): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.updateUser(id, usuario)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al actualizar: ', err);
          this.error.set('No se puede actualizar');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('Usuario Actualizado: ', response);
        this.volver();
      })
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }



}
