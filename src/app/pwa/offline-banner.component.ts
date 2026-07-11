import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { OfflineSyncService } from '../service/offline-sync.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [],
  templateUrl: './offline-banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./offline-banner.component.css']
})
export class OfflineBannerComponent {
  isOnline = navigator.onLine;
  sync: OfflineSyncService;

  constructor(sync: OfflineSyncService) {
    this.sync = sync;
  }

  @HostListener('window:online')
  onOnline() {
    this.isOnline = true;
    this.sync.syncNow();
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOnline = false;
  }
}
