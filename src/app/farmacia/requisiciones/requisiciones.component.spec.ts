import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RequisicionesComponent } from './requisiciones.component';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { mockInsumosService, mockAuthService } from '../../insumos/insumos.service.mock';

describe('RequisicionesComponent', () => {
  let fixture: ComponentFixture<RequisicionesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RequisicionesComponent ],
      providers: [
        provideRouter([]),
        { provide: InsumosService, useValue: mockInsumosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RequisicionesComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
