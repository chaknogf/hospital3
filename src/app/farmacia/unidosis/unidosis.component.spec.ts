import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UnidosisFarmaciaComponent } from './unidosis.component';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { mockInsumosService, mockAuthService } from '../../insumos/insumos.service.mock';

describe('UnidosisFarmaciaComponent', () => {
  let fixture: ComponentFixture<UnidosisFarmaciaComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UnidosisFarmaciaComponent ],
      providers: [
        provideRouter([]),
        { provide: InsumosService, useValue: mockInsumosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UnidosisFarmaciaComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
