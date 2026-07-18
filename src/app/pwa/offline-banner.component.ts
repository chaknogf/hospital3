import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { OfflineSyncService } from '../service/offline-sync.service';
import { PendingMutation } from '../service/offline-database.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [],
  templateUrl: './offline-banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./offline-banner.component.css']
})
export class OfflineBannerComponent {
  sync: OfflineSyncService;

  constructor(sync: OfflineSyncService) {
    this.sync = sync;
  }

  @HostListener('window:online')
  onOnline() {
    this.sync.syncNow();
  }

  resumenOperacion(m: PendingMutation): string {
    const partes = m.url.split('/');
    const recurso = partes[partes.length - 1] || partes[partes.length - 2] || m.url;
    return `${m.method} /…/${recurso}`;
  }
}
