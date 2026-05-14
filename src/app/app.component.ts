import { DestroyRef, Inject, PLATFORM_ID, Component, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styleUrls: [],
})
export class AppComponent {
  readonly _theme = inject(ThemeService);
  readonly _lang = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      return;
    }

    history.scrollRestoration = 'manual';

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const [pathWithQuery, fragment = ''] = this.router.url.split('#');
        const path = pathWithQuery.split('?')[0];

        if (path === '' || path === '/') {
          return;
        }

        if (fragment) {
          return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
  }
}
