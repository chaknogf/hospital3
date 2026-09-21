import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { AgendarComponent } from './agendar.component';
import { CitaService } from '../cita.service';
import { PacienteService } from '../../patient/paciente.service';
import { MedicosService } from '../../../std/medicos/medicos.service';

describe('AgendarComponent', () => {
  let component: AgendarComponent;
  let fixture: ComponentFixture<AgendarComponent>;
  let medicosService: jasmine.SpyObj<MedicosService>;

  const pediatria = { id: 4, nombre: 'Pediatría', codigo: 'PEDI', abreviatura: 'PED' };
  const ginecologia = { id: 5, nombre: 'Ginecología', codigo: 'GINE', abreviatura: 'GIN' };
  const personal = [
    { id: 10, nombre: 'Personal Pediatría', especialidad_id: 4, activo: true },
    { id: 20, nombre: 'Personal Ginecología', especialidad_id: 5, activo: true },
  ] as any;

  beforeEach(async () => {
    medicosService = jasmine.createSpyObj<MedicosService>('MedicosService', [
      'getEspecialidades',
      'getAllMedicos',
      'getMedicos',
    ]);
    medicosService.getEspecialidades.and.returnValue(of([pediatria, ginecologia]));
    medicosService.getAllMedicos.and.returnValue(of(personal));
    medicosService.getMedicos.and.returnValue(of({
      total: 1,
      personal_atencion: [personal[1]],
    }));

    const citaService = jasmine.createSpyObj<CitaService>('CitaService', [
      'getDiasInhabiles',
      'conteoCitas',
      'getCita',
      'crearCita',
      'updateCita',
    ]);
    citaService.getDiasInhabiles.and.returnValue(of([]));
    citaService.conteoCitas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgendarComponent],
      providers: [
        { provide: CitaService, useValue: citaService },
        { provide: MedicosService, useValue: medicosService },
        { provide: PacienteService, useValue: jasmine.createSpyObj('PacienteService', ['getPaciente']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: Location, useValue: { back: jasmine.createSpy('back') } },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: (value: string) => value } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('consulta el backend con el id exacto de la especialidad seleccionada', fakeAsync(() => {
    component.form.get('especialidad')?.setValue('GINE');
    tick(250);

    expect(medicosService.getMedicos).toHaveBeenCalledWith({
      activo: true,
      especialidad_id: 5,
      skip: 0,
      limit: 500,
    });
    expect(component.personalFiltrado.map(persona => persona.id)).toEqual([20]);
  }));

  it('filtra defensivamente la respuesta aunque el backend devuelva otra especialidad', fakeAsync(() => {
    medicosService.getMedicos.and.returnValue(of({
      total: 2,
      personal_atencion: [personal[1], personal[0]],
    }));

    component.form.get('especialidad')?.setValue('GINE');
    tick(250);

    expect(component.personalFiltrado.every(persona => persona.especialidad_id === 5)).toBeTrue();
    expect(component.personalFiltrado.length).toBe(1);
  }));

  it('mantiene la asignación opcional y muestra todo el personal sin especialidad', fakeAsync(() => {
    component.form.get('especialidad')?.setValue('');
    tick(250);

    expect(component.personalFiltrado.map(persona => persona.id)).toEqual([10, 20]);
  }));
});
