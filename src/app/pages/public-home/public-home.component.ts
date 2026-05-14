import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  effect,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { FruitSliceComponent } from '../fruit-slice/fruit-slice.component';
import { MarqueeComponent } from '../../shared/components/marquee/marquee.component';
import { OriginsComponent } from '../origins/origins.component';
import { WhyUsComponent } from '../../shared/components/why-us/why-us.component';
import { ContactNewsletterComponent } from '../contact-newsletter/contact-newsletter.component';
import { FooterComponent } from '../footer/footer.component';
import { LanguageService, Language } from '../../core/services/language.service';
import { SiteContentService } from '../../core/services/site-content.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    FruitSliceComponent,
    MarqueeComponent,
    OriginsComponent,
    WhyUsComponent,
    // PublicDataSectionsComponent,
    ContactNewsletterComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar></app-navbar>
    <main>
      <app-hero></app-hero>
      <app-fruit-slice></app-fruit-slice>
      <app-marquee></app-marquee>
      <app-about></app-about>
      <app-origins></app-origins>
      <app-why-us></app-why-us>
      <!-- <app-public-data-sections></app-public-data-sections> -->
      <app-contact-newsletter></app-contact-newsletter>
    </main>
    <app-footer></app-footer>
  `,
})
export class PublicHomeComponent implements AfterViewInit, OnDestroy {
  private readonly SECTION_STORAGE_KEY = 'elmostafa_last_public_section';
  private readonly scrollSectionIds = [
    'home',
    'process',
    'about',
    'origins',
    'why-us',
    'contact',
  ];
  private isBrowser: boolean;
  private selectedEditorElement: HTMLElement | null = null;
  private isRefreshQueued = false;
  private initialScrollHandled = false;
  private isRestoringScroll = false;
  private scrollRestoreReleaseTimer: number | null = null;
  private scrollMemoryTimer: number | null = null;
  private readonly sectionAlignmentTimers: number[] = [];
  private readonly windowFocusHandler = () => {
    this.refreshPublicContent();
  };
  private readonly visibilityChangeHandler = () => {
    if (document.visibilityState === 'visible') {
      this.refreshPublicContent();
    }
  };
  private readonly editorCaptureClickHandler = (event: MouseEvent) => {
    this.onEditorCaptureClick(event);
  };
  private readonly editorCaptureSubmitHandler = (event: Event) => {
    this.onEditorCaptureSubmit(event);
  };
  private readonly directSectionNavigationHandler = (event: Event) => {
    this.onDirectSectionNavigation(event);
  };
  readonly isEditorMode = signal(false);

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly route: ActivatedRoute,
    private readonly languageService: LanguageService,
    private readonly siteContent: SiteContentService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    effect(() => {
      const locale = this.languageService.currentLang();
      const editorMode = this.isEditorMode();

      if (!this.isBrowser || !editorMode) {
        return;
      }

      queueMicrotask(() => {
        this.syncEditorLocale(locale);
      });
    });
  }

  ngAfterViewInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const editor = params.get('editor') === 'true';
      const locale = params.get('locale');

      if (locale === 'ar' || locale === 'en') {
        this.languageService.setLanguage(locale as Language, { persist: !editor });
      }

      this.isEditorMode.set(editor);

      if (this.isBrowser) {
        document.body.classList.toggle('editor-preview', editor);
        this.refreshPublicContent();
      }
    });

    this.route.fragment.subscribe((fragment) => {
      if (!this.isBrowser) {
        return;
      }

      this.scheduleInitialScroll(fragment);
    });

    if (this.isBrowser) {
      this.refreshPublicContent();
      document.addEventListener('click', this.editorCaptureClickHandler, true);
      document.addEventListener('submit', this.editorCaptureSubmitHandler, true);
      window.addEventListener('focus', this.windowFocusHandler);
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
      window.addEventListener('public-section-nav', this.directSectionNavigationHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.body.classList.remove('editor-preview');
      document.removeEventListener('click', this.editorCaptureClickHandler, true);
      document.removeEventListener('submit', this.editorCaptureSubmitHandler, true);
      window.removeEventListener('focus', this.windowFocusHandler);
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      window.removeEventListener('public-section-nav', this.directSectionNavigationHandler);
      this.clearScheduledSectionAlignment();
      if (this.scrollRestoreReleaseTimer !== null) {
        window.clearTimeout(this.scrollRestoreReleaseTimer);
      }
      if (this.scrollMemoryTimer !== null) {
        window.clearTimeout(this.scrollMemoryTimer);
      }
    }
  }

  private scheduleInitialScroll(fragment: string | null): void {
    if (fragment) {
      this.initialScrollHandled = true;
      this.scheduleSectionAlignment(fragment);
      return;
    }

    if (this.initialScrollHandled) {
      return;
    }

    this.initialScrollHandled = true;
    const targetId = this.getStoredSectionId() ?? 'home';

    this.scrollToSavedSection(targetId, 'auto');
    window.setTimeout(() => this.scrollToSavedSection(targetId, 'auto'), 650);
  }

  private scheduleSectionAlignment(sectionId: string): void {
    this.clearScheduledSectionAlignment();

    for (const delay of [180, 520, 980]) {
      const timerId = window.setTimeout(() => {
        this.scrollToSavedSection(sectionId, 'auto');
      }, delay);

      this.sectionAlignmentTimers.push(timerId);
    }
  }

  private clearScheduledSectionAlignment(): void {
    while (this.sectionAlignmentTimers.length > 0) {
      const timerId = this.sectionAlignmentTimers.pop();
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    }
  }

  private scrollToSavedSection(sectionId: string, behavior: ScrollBehavior): void {
    const target = document.getElementById(sectionId) ?? document.getElementById('home');

    if (!target) {
      return;
    }

    this.isRestoringScroll = true;
    window.scrollTo({
      top: this.getSectionScrollTop(target),
      left: 0,
      behavior,
    });
    this.releaseScrollRestoreLock(behavior === 'smooth' ? 950 : 180);
  }

  private getSectionScrollTop(target: HTMLElement): number {
    const nav = document.querySelector<HTMLElement>('app-navbar nav');
    const navHeight = nav?.getBoundingClientRect().height ?? 0;
    const extraOffset = window.innerWidth <= 991 ? 16 : 22;
    const absoluteTop = window.scrollY + target.getBoundingClientRect().top;

    return Math.max(0, Math.round(absoluteTop - navHeight - extraOffset));
  }

  private releaseScrollRestoreLock(delay: number): void {
    if (this.scrollRestoreReleaseTimer !== null) {
      window.clearTimeout(this.scrollRestoreReleaseTimer);
    }

    this.scrollRestoreReleaseTimer = window.setTimeout(() => {
      this.scrollRestoreReleaseTimer = null;
      this.isRestoringScroll = false;
      this.rememberCurrentSection();
    }, delay);
  }

  private onDirectSectionNavigation(event: Event): void {
    const sectionId = (event as CustomEvent<{ sectionId?: string }>).detail?.sectionId;
    if (!this.isBrowser || !sectionId) {
      return;
    }

    this.initialScrollHandled = true;
    this.scrollToSavedSection(sectionId, 'smooth');
    this.scheduleSectionAlignment(sectionId);
  }

  private getStoredSectionId(): string | null {
    const value = sessionStorage.getItem(this.SECTION_STORAGE_KEY);
    return value && this.scrollSectionIds.includes(value) ? value : null;
  }

  private rememberCurrentSection(): void {
    if (!this.isBrowser || this.isRestoringScroll) {
      return;
    }

    const activeSection = this.findActiveSectionId();
    if (activeSection) {
      sessionStorage.setItem(this.SECTION_STORAGE_KEY, activeSection);
    }
  }

  private queueSectionMemoryUpdate(): void {
    if (!this.isBrowser || this.isRestoringScroll) {
      return;
    }

    if (this.scrollMemoryTimer !== null) {
      window.clearTimeout(this.scrollMemoryTimer);
    }

    this.scrollMemoryTimer = window.setTimeout(() => {
      this.scrollMemoryTimer = null;
      this.rememberCurrentSection();
    }, 120);
  }

  private findActiveSectionId(): string | null {
    const anchorY = window.innerHeight * 0.42;
    let closest: { id: string; distance: number } | null = null;

    for (const id of this.scrollSectionIds) {
      const element = document.getElementById(id);

      if (!element) {
        continue;
      }

      const rect = element.getBoundingClientRect();

      if (rect.top <= anchorY && rect.bottom >= anchorY) {
        return id;
      }

      const distance = Math.min(Math.abs(rect.top - anchorY), Math.abs(rect.bottom - anchorY));
      if (!closest || distance < closest.distance) {
        closest = { id, distance };
      }
    }

    return closest?.id ?? null;
  }

  private refreshPublicContent(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.isRefreshQueued) {
      return;
    }

    this.isRefreshQueued = true;
    queueMicrotask(() => {
      this.isRefreshQueued = false;
      this.siteContent.refreshContent();
      this.languageService.refreshRemoteContent();
    });
  }

  private syncEditorLocale(locale: Language): void {
    if (!this.isBrowser || !this.isEditorMode()) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('editor', 'true');
    currentUrl.searchParams.set('locale', locale);
    window.history.replaceState(
      window.history.state,
      '',
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );

    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'editor-locale-changed',
          payload: { locale },
        },
        window.location.origin,
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser || !this.isEditorMode()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (this.isIgnoredEditorTarget(target)) {
      return;
    }

    const editableNode = target?.closest<HTMLElement>('.editor-editable-node');

    if (!editableNode) {
      return;
    }

    if (this.canUseNativeInlineEditing(editableNode)) {
      this.selectEditorNode(editableNode);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.selectEditorNode(editableNode);
  }

  private onEditorCaptureClick(event: MouseEvent): void {
    if (!this.isBrowser || !this.isEditorMode()) {
      return;
    }

    if (this.isIgnoredEditorTarget(event.target)) {
      return;
    }

    const directEditableNode =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('.editor-editable-node')
        : null;
    const editableNode = directEditableNode ?? this.resolveInteractiveEditableNode(event.target);

    if (editableNode) {
      if (this.canUseNativeInlineEditing(editableNode)) {
        this.selectEditorNode(editableNode);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      this.selectEditorNode(editableNode);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private onEditorCaptureSubmit(event: Event): void {
    if (!this.isBrowser || !this.isEditorMode()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private resolveInteractiveEditableNode(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) {
      return null;
    }

    if (this.isIgnoredEditorTarget(target)) {
      return null;
    }

    const editableNode = target.closest<HTMLElement>('.editor-editable-node');
    if (editableNode?.closest('a, button, [role="button"]')) {
      return editableNode;
    }

    const interactiveContainer = target.closest<HTMLElement>('a, button, [role="button"]');
    return interactiveContainer?.querySelector<HTMLElement>('.editor-editable-node') ?? null;
  }

  private isIgnoredEditorTarget(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest('[data-editor-ignore="true"]');
  }

  private canUseNativeInlineEditing(editableNode: HTMLElement): boolean {
    return (
      editableNode.classList.contains('editor-inline-target') &&
      !editableNode.closest('a, button, [role="button"]')
    );
  }

  private selectEditorNode(editableNode: HTMLElement): void {
    const nodeId = editableNode.dataset['editId'] ?? '';
    const declaredType = editableNode.dataset['editType'];
    const isImage = editableNode.tagName === 'IMG' || declaredType === 'image';
    const value = isImage
      ? (editableNode.getAttribute('src') ?? '')
      : declaredType === 'html'
        ? editableNode.innerHTML.trim()
        : declaredType === 'textarea'
          ? editableNode.innerText.trim()
          : (editableNode.textContent ?? '').trim();

    this.selectedEditorElement?.classList.remove('editor-node-selected');
    editableNode.classList.add('editor-node-selected');
    this.selectedEditorElement = editableNode;

    window.parent.postMessage(
      {
        type: 'editor-node-selected',
        payload: {
          nodeId,
          value,
          nodeType: declaredType ?? (isImage ? 'image' : 'text'),
        },
      },
      window.location.origin,
    );
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isBrowser) {
      document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      document.body.style.setProperty('--scroll-progress', `${progress}`);
      this.queueSectionMemoryUpdate();
    }
  }
}
