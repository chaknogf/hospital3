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
export class UpdateNotificationComponent implements OnInit {
  showUpdate = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
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
