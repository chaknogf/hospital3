import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconService } from '../../../service/icon.service';
import { ProceMedico, Procedimiento, ProceMedicoCreate, ProceMedicoUpdate } from '../../../interface/procedimientos';
import { StdService } from '../../std.service';
import { Dict, especialidadesProcedimientos, lugarServicios } from '../../../enum/diccionarios';

@Component({
  selector: 'app-procemedico',
  templateUrl: './procemedico.component.html',
  styleUrls: ['./procemedico.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ProcemedicoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  procedimientoId: number | null = null;

  procedimientoActual: ProceMedico | null = null;
  especialidadesfiltradas: Dict[] = especialidadesProcedimientos;
  lugarServicios: Dict[] = lugarServicios;
  catalogo: Procedimiento[] = [];

  cargando = false;
  guardando = false;
  enEdicion = false;

  form: FormGroup = this.fb.group({

    fecha: [''],

    lugar_servicio: [''],

    sexo: [''],

    id_procedimiento: [null],

    especialidad: [''],

    cantidad: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    responsable: [''],

    anestesia: [0]

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

    this.cargarCatalogo();

    this.procedimientoId =
      Number(this.route.snapshot.paramMap.get('id'));

    if (this.procedimientoId) {

      this.enEdicion = true;

      this.cargarProcedimiento(
        this.procedimientoId
      );
    }
  }

  cargarCatalogo(): void {
    this.api.getCatalogo().subscribe({
      next: data => {
        this.catalogo = data;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  cargarProcedimiento(id: number): void {

    this.cargando = true;

    this.api.getProcedimientoMedico(id).subscribe({

      next: data => {

        this.procedimientoActual = data;

        this.form.patchValue({

          fecha: data.fecha,

          lugar_servicio: data.lugar_servicio,

          sexo: data.sexo,

          id_procedimiento:
            data.id_procedimiento,

          especialidad:
            data.especialidad,

          cantidad:
            data.cantidad,

          responsable:
            data.responsable,

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
      ProceMedicoCreate |
      ProceMedicoUpdate = {

      ...this.form.value

    };

    if (
      this.enEdicion &&
      this.procedimientoId
    ) {

      this.api.updateProcedimientoMedico(
        this.procedimientoId,
        payload
      ).subscribe({

        next: () => {

          this.router.navigate([
            '/procedimientosmenores'
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

    this.api.createProcedimientoMedico(
      payload as ProceMedicoCreate
    ).subscribe({

      next: () => {

        this.router.navigate([
          '/procedimientosmenores'
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
    this.location.back();
  }

  get f() {
    return this.form.controls;
  }
}
