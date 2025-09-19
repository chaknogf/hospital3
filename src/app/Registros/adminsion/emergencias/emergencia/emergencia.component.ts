import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { SoloNumeroDirective } from '../../../../directives/soloNumero.directive';
import { UnaPalabraDirective } from '../../../../directives/unaPalabra.directive';
import { Consulta } from '../../../../interface/consultas';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService } from '../../../../service/api.service';
import { ConsultaService } from '../../../../service/consulta.service';




@Component({
  selector: 'app-emergencia',
  templateUrl: './emergencia.component.html',
  styleUrls: ['./emergencia.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // UnaPalabraDirective,
    // SoloNumeroDirective,
    // NgxMaskDirective,

  ],
  providers: [
    provideNgxMask()
  ]
})
export class EmergenciaComponent implements OnInit {

  emergenciaForm!: FormGroup;
  usuarioActual = '';
  enEdicion = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ConsultaService,
    private readonly fb: FormBuilder,
    private readonly sanitizer: DomSanitizer,

  ) {
    this.emergenciaForm = this.fb.group({
      paciente_id: [0, Validators.required],
      tipo_consulta: [0, Validators.required],
      especialidad: [0, Validators.required],
      servicio: [0, Validators.required],
      documento: ['', Validators.required],
      fecha_consulta: ['', Validators.required],
      hora_consulta: ['', Validators.required],
      ciclo: this.fb.group({}),
      indicadores: this.fb.group({}),
      detalle_clinico: this.fb.group({}),
      sistema: this.fb.group({}),
      signos_vitales: this.fb.group({}),
      ansigmas: this.fb.group({}),
      antecedentes: this.fb.group({}),
      ordenes: this.fb.group({}),
      estudios: this.fb.group({})
    })



  }

  ngOnInit() {
    this.usuarioActual = localStorage.getItem('username') || '';

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.api.getConsulta(id)
          .then(data => {
            this.enEdicion = true;
            this.emergenciaForm.patchValue(data);
          })
          .catch(error => {
            console.error('Error al obtener la consulta:', error);
          });
      }
    }
  }



}
