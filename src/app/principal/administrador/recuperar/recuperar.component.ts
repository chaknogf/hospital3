import { roles } from './../../../enum/roles.enum';
import { of } from 'rxjs';
import { Component, OnInit, OnDestroy, inject, signal, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../service/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CrearUsuario, Passreset, Usuario, UsuarioOut } from '../../../interface/usuarios.interface';
import { catchError, finalize, takeUntil } from 'rxjs';
import { addIcon, removeIcon, menuIcon, cancelIcon, findIcon, searchIcon, arrowDown, tablaShanonIcon, editIcon, skipLeft } from '../../../shared/icons/svg-icon';
import { Subject } from 'rxjs';
import { Values } from './../../../enum/roles.enum';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,]
})

export class RecuperarComponent implements OnInit {

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
      email: [''],
      password: ['']
    });
  }


  guardar(): void {
    if (this.form.invalid) {
      this.error.set('Completa los campos requeridos');
      return;
    }

    const data = this.form.value as CrearUsuario;

    this.recuperar(data);
  }




  private recuperar(usuario: Passreset): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.passReset(usuario)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          console.error('error al restablecer: ', err);
          this.error.set('No se puede restablecer');
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return;

        console.log('Usuario Restablecido: ', response);
        this.volver();
      })
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }



}
