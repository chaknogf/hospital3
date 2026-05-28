/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrestamosService } from './prestamos.service';

describe('Service: Prestamos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrestamosService]
    });
  });

  it('should ...', inject([PrestamosService], (service: PrestamosService) => {
    expect(service).toBeTruthy();
  }));
});
