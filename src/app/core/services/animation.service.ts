import { Injectable, signal, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CursorPosition {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  readonly mousePosition = signal<CursorPosition>({ x: 0, y: 0 });
  readonly laggingPosition = signal<CursorPosition>({ x: 0, y: 0 });

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initCursorTracking();
    }
  }

  private initCursorTracking() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', (e) => {
        const next = { x: e.clientX, y: e.clientY };
        this.mousePosition.set(next);

        if (this.laggingPosition().x === 0 && this.laggingPosition().y === 0) {
          this.laggingPosition.set(next);
        }
      }, { passive: true });

      const animateLaggingCursor = () => {
        const target = this.mousePosition();
        const current = this.laggingPosition();
        
        // easing factor for lag
        const ease = 0.38;
        
        const dx = target.x - current.x;
        const dy = target.y - current.y;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          this.laggingPosition.set({
            x: current.x + dx * ease,
            y: current.y + dy * ease
          });
        }
        
        requestAnimationFrame(animateLaggingCursor);
      };
      
      requestAnimationFrame(animateLaggingCursor);
    });
  }
}
