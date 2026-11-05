import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlmacenesComponent } from './almacenes.component';
import { InsumosService } from '../../insumos/insumos.service';
import { AuthService } from '../../service/auth.service';
import { mockInsumosService, mockAuthService } from '../../insumos/insumos.service.mock';

describe('AlmacenesComponent', () => {
  let fixture: ComponentFixture<AlmacenesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AlmacenesComponent ],
      providers: [
        provideRouter([]),
        { provide: InsumosService, useValue: mockInsumosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AlmacenesComponent);
    fixture.detectChanges();
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
