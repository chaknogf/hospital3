import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Procedimiento,
  ProcedimientoCreate,
  ProcedimientoUpdate
} from '../../../interface/procedimientos';

import { StdService } from '../../std.service';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-nuevoprocedimiento',
  templateUrl: './nuevoprocedimiento.component.html',
  styleUrls: ['./nuevoprocedimiento.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class NuevoprocedimientoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  procedimientoId: number | null = null;

  procedimientoActual: Procedimiento | null = null;

  cargando = false;
  guardando = false;
  enEdicion = false;

  form: FormGroup = this.fb.group({

    abreviatura: [''],

    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],

    descripcion: [''],

    anestesia: [
      0,
      [
        Validators.min(0)
      ]
    ]

  });

  saveIcon: any;
  cancelIcon: any;

  constructor(
    private api: StdService,
    private iconService: IconService
  ) {

    this.saveIcon =
      this.iconService.getIcon('saveIcon');

    this.cancelIcon =
      this.iconService.getIcon('cancelIcon');
  }

  ngOnInit(): void {

    this.procedimientoId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (this.procedimientoId) {

      this.enEdicion = true;

      this.cargarProcedimiento(
        this.procedimientoId
      );
    }
  }

  cargarProcedimiento(id: number): void {

    this.cargando = true;

    this.api
      .getProcedimientoCatalogo(id)
      .subscribe({

        next: data => {

          this.procedimientoActual = data;

          this.form.patchValue({

            abreviatura:
              data.abreviatura,

            nombre:
              data.nombre,

            descripcion:
              data.descripcion,

            anestesia:
              data.anestesia

          });
        },

        error: err => {

          console.error(err);
        },

        complete: () => {

          this.cargando = false;
        }

      });
  }

  guardar(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.guardando = true;

    const payload:
      ProcedimientoCreate |
      ProcedimientoUpdate = {

      ...this.form.value

    };

    if (
      this.enEdicion &&
      this.procedimientoId
    ) {

      this.api.updateProcedimiento(
        this.procedimientoId,
        payload
      ).subscribe({

        next: () => {

          this.router.navigate([
            '/catalogoProcedimientos'
          ]);
        },

        error: err => {

          console.error(err);

          this.guardando = false;
        },

        complete: () => {

          this.guardando = false;
        }

      });

      return;
    }

    this.api.createProcedimiento(
      payload as ProcedimientoCreate
    ).subscribe({

      next: () => {

        this.router.navigate([
          '/catalogoProcedimientos'
        ]);
      },

      error: err => {

        console.error(err);

        this.guardando = false;
      },

      complete: () => {

        this.guardando = false;
      }

    });
  }

  volver(): void {

    this.router.navigate([
      '/catalogoProcedimientos'
    ]);
  }

  get f() {

    return this.form.controls;
  }

}
