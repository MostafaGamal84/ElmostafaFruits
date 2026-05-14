import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  Input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() threshold = 0.1;
  @Input() rootMargin = '0px 0px -50px 0px';
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.el.nativeElement.classList.add('premium-reveal-hidden');
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.el.nativeElement.classList.add('visible');
              this.observer?.unobserve(this.el.nativeElement);
            }
          });
        },
        { threshold: this.threshold, rootMargin: this.rootMargin },
      );

      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
