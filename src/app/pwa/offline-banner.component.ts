import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.css']
})
export class OfflineBannerComponent {
  isOnline = navigator.onLine;

  @HostListener('window:online')
  onOnline() {
    this.isOnline = true;
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOnline = false;
  }
}
