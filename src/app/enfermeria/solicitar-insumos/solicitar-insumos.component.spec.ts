import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SolicitarInsumosComponent } from './solicitar-insumos.component';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { mockInsumosService, mockAuthService } from '../../insumos/insumos.service.mock';

describe('SolicitarInsumosComponent', () => {
  let fixture: ComponentFixture<SolicitarInsumosComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SolicitarInsumosComponent ],
      providers: [
        provideRouter([]),
        { provide: InsumosService, useValue: mockInsumosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SolicitarInsumosComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
