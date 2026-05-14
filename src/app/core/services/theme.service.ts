import { Injectable, signal, effect, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { readLocalStorage, writeLocalStorage } from '../utils/browser-storage.util';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'elmostafa_theme';
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentTheme = signal<Theme>('dark');
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.initTheme();

    effect(() => {
      const theme = this.currentTheme();
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        writeLocalStorage(this.THEME_KEY, theme);
      }
    });
  }

  private initTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = readLocalStorage(this.THEME_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.currentTheme.set(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      }
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
