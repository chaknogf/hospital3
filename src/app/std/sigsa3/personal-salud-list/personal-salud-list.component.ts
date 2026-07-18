import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Sigsa3Service } from '../sigsa3.service';
import { PersonalSalud } from '../../../interface/sigsa3.interface';
import { IconService } from '../../../service/icon.service';

@Component({
  selector: 'app-personal-salud-list',
  templateUrl: './personal-salud-list.component.html',
  styleUrls: ['./personal-salud-list.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class PersonalSaludListComponent {
  private api = inject(Sigsa3Service);
  private router = inject(Router);
  private location = inject(Location);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  registros: PersonalSalud[] = [];
  cargando = false;
  procesando = false;

  resultadoOperacion: any = null;

  icons: any = {
    search: this.iconService.getIcon('searchIcon'),
    create: this.iconService.getIcon('createIcon'),
    edit: this.iconService.getIcon('editIcon'),
    delete: this.iconService.getIcon('deletInput'),
    menu: this.iconService.getIcon('menuIcon'),
  };

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargando = true;
    this.api.listarPersonalSalud().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.registros = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  volver(): void { this.location.back(); }

  nuevo(): void { this.router.navigate(['/personal-salud/nuevo']); }

  editar(id: number): void { this.router.navigate(['/personal-salud/editar', id]); }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este registro de personal salud?')) return;
    this.api.eliminarPersonalSalud(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.cargar(); this.cdr.markForCheck(); },
      error: () => { this.cdr.markForCheck(); }
    });
  }
}
