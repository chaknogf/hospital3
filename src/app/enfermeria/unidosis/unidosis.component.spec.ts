import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UnidosisEnfermeriaComponent } from './unidosis.component';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { mockInsumosService, mockAuthService } from '../../insumos/insumos.service.mock';

describe('UnidosisEnfermeriaComponent', () => {
  let fixture: ComponentFixture<UnidosisEnfermeriaComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UnidosisEnfermeriaComponent ],
      providers: [
        provideRouter([]),
        { provide: InsumosService, useValue: mockInsumosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UnidosisEnfermeriaComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
