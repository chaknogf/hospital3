/* tslint:disable:no-unused-variable */

import { TestBed, waitForAsync, inject } from '@angular/core/testing';
import { PersonalAtencionService } from './personal_atencion.service';

describe('Service: Medicos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonalAtencionService]
    });
  });

  it('should ...', inject([PersonalAtencionService], (service: PersonalAtencionService) => {
    expect(service).toBeTruthy();
  }));
});
