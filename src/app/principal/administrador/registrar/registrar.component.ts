import { roles } from './../../../enum/roles.enum';
import { of } from 'rxjs';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CrearUsuario, Usuario, UsuarioOut } from '../../../interface/usuarios.interface';
import { catchError, finalize, takeUntil } from 'rxjs';
import { addIcon, removeIcon, menuIcon, cancelIcon, findIcon, searchIcon, arrowDown, tablaShanonIcon, editIcon, skipLeft } from '../../../shared/icons/svg-icon';
import { Subject } from 'rxjs';
import { Values } from './../../../enum/roles.enum';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, FormsModule]
})

export class RegistrarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  form: FormGroup;
  private destroy$ = new Subject<void>();

  usuario: CrearUsuario | null = null;
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

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======= FORMULARIO =======
  private crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: [''],
      username: [''],
      email: [''],
    });
  }


  guardar(): void {
    if (this.form.invalid) {
      this.error.set('Completa los campos requeridos');
      return;
    }

    const data = this.form.value as CrearUsuario;

    this.crear(data);
  }




  private crear(usuario: CrearUsuario): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.createUser(usuario)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al crear: ', err);
          this.error.set('No se puede crear');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('Usuario Creado: ', response);
        this.volver();
      })
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }



}
