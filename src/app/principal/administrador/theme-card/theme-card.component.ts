import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'theme-card',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['_theme-card.css'],
  template: `
    <div class="theme-card [variant] [size]" [class]="classes">
      <div class="theme-card__header" *ngIf="showHeader">
        <span class="theme-card__icon">{{ icon }}</span>
        <span class="theme-card__title">{{ title }}</span>
        <div class="theme-card__actions"><ng-content select="[action]"></ng-content></div>
      </div>
      <div class="theme-card__body">
        <ng-content select="[body]"></ng-content>
      </div>
      <div class="theme-card__footer" *ngIf="showFooter">
        <span class="theme-card__footer-meta">{{ footer }}</span>
        <ng-content select="[action-footer]"></ng-content>
      </div>
    </div>
  `
})
export class ThemeCardComponent {
  @Input() variant: 'data' | 'stat' | 'list' | 'timeline' | 'profile' = 'data';
  @Input() title = '';
  @Input() icon = '🏥';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() footer = '';
  @Input() size: 'sm' | 'lg' | 'flush' = 'lg';

  get classes(): string {
    const v = this.variant;
    const s = this.size;
    let cls = 'theme-card';

    cls += ` theme-card--${v}`;
    if (s !== 'flush') cls += ` theme-card--${s}`;

    if (v === 'profile' && s === 'lg') cls += ' theme-card--profile-lg';
    if (v === 'stat' && s === 'lg') cls += ' theme-card--stat-lg';
    if (v === 'data' && s === 'lg') cls += ' theme-card--data-lg';

    return cls;
  }
}