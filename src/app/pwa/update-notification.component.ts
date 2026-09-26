import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [],
  templateUrl: './update-notification.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./update-notification.component.css']
})
/** Avisa cuando hay una versión nueva lista y la activa recargando la aplicación. */
export class UpdateNotificationComponent implements OnInit {
  showUpdate = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      // Se notifica cuando la versión nueva está lista, no al detectar cualquier cambio.
      this.swUpdate.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdate = true;
        });
    }
  }

  actualizar() {
    this.showUpdate = false;
    window.location.reload();
  }
}
