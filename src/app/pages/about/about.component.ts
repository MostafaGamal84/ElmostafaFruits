import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="timeline-section" id="about" #timelineSection>
      <div class="sticky-viewport">
        <!-- Deep Parallax Typography Background -->
        <div
          class="bg-typography"
          [style.transform]="'translateY(-50%) translateX(' + scrollProgress * -30 + 'vw)'"
        >
          PRO<span class="text-outline">CESS</span>
        </div>

        <div class="header-content" [style.opacity]="1 - scrollProgress * 5">
          <span class="eyebrow" data-edit-id="about.eyebrow" data-edit-label="About Eyebrow">{{ lang.translateEditable('about.eyebrow', 'hero.story') }}</span>
          <h2 class="display-3 font-playfair fw-bold theme-text mb-0" data-edit-id="about.title" data-edit-label="About Title">
            {{ lang.translateEditable('about.title', 'hero.journey') }}
          </h2>
          <p class="theme-text" data-edit-id="about.subtitle" data-edit-label="About Subtitle">{{ lang.translateEditable('about.subtitle', 'hero.scroll') }}</p>
        </div>

        <!-- The Glowing Pipeline -->
        <div class="pipeline-track">
          <div class="pipeline-fill" [style.height.%]="scrollProgress * 100"></div>
        </div>

        <!-- The Rolling Fruit Tracker -->
        <div class="tracker-container" [style.top]="trackerTop">
          <!-- Aura Glow -->
          <div
            class="tracker-glow"
            [style.transform]="'translate(-50%, -50%) scale(' + trackerScale + ')'"
          ></div>

          <img
            src="assets/real-pineapple-cutout.png"
            class="tracker-img"
            data-edit-id="about.tracker.orange"
            data-edit-label="About Tracker Pineapple"
            data-edit-type="image"
            data-edit-scope="global"
            [style.filter]="'contrast(1.2)'"
            [style.opacity]="orangeOpacity"
            [style.transform]="
              'rotate(' + scrollProgress * 1080 + 'deg) scale(' + trackerScale + ')'
            "
            alt="Pineapple"
            loading="lazy"
            decoding="async"
          />
          <img
            src="assets/real-kiwi.png"
            class="tracker-img"
            data-edit-id="about.tracker.kiwi"
            data-edit-label="About Tracker Kiwi"
            data-edit-type="image"
            data-edit-scope="global"
            [style.filter]="'contrast(1.2)'"
            [style.opacity]="kiwiOpacity"
            [style.transform]="
              'rotate(' + scrollProgress * 1080 + 'deg) scale(' + trackerScale + ')'
            "
            alt="Kiwi"
            loading="lazy"
            decoding="async"
          />
          <img
            src="assets/real-apple.png"
            class="tracker-img"
            data-edit-id="about.tracker.apple"
            data-edit-label="About Tracker Apple"
            data-edit-type="image"
            data-edit-scope="global"
            [style.filter]="'contrast(1.2)'"
            [style.opacity]="strawberryOpacity"
            [style.transform]="
              'rotate(' + scrollProgress * 1080 + 'deg) scale(' + trackerScale + ')'
            "
            alt="Apple"
            loading="lazy"
            decoding="async"
          />
        </div>

        <!-- Nodes / Waypoints -->
        <div
          class="node-content node-left"
          [class.active]="scrollProgress > 0.12 && scrollProgress < 0.4"
          [style.top.%]="nodeTopPositions[0]"
        >
          <div class="glass-node">
            <span class="node-number">01</span>
            <h3 class="font-playfair text-gradient" data-edit-id="about.node1.title" data-edit-label="About Node 1 Title">{{ lang.translateEditable('about.node1.title', 'about.nodes.0.title') }}</h3>
            <p class="theme-text mb-0" data-edit-id="about.node1.desc" data-edit-label="About Node 1 Description" data-edit-type="textarea">
              {{ lang.translateEditable('about.node1.desc', 'about.nodes.0.desc') }}
            </p>
          </div>
        </div>

        <!-- Node 2: The Selection (Show from 45% to 75%) -->
        <div
          class="node-content node-right"
          [class.active]="scrollProgress > 0.4 && scrollProgress < 0.68"
          [style.top.%]="nodeTopPositions[1]"
        >
          <div class="glass-node">
            <span class="node-number">02</span>
            <h3 class="font-playfair text-gradient" data-edit-id="about.node2.title" data-edit-label="About Node 2 Title">{{ lang.translateEditable('about.node2.title', 'about.nodes.1.title') }}</h3>
            <p class="theme-text mb-0" data-edit-id="about.node2.desc" data-edit-label="About Node 2 Description" data-edit-type="textarea">
              {{ lang.translateEditable('about.node2.desc', 'about.nodes.1.desc') }}
            </p>
          </div>
        </div>

        <!-- Node 3: The Delivery (Show past 75%) -->
        <div
          class="node-content node-left"
          [class.active]="scrollProgress > 0.68"
          [style.top.%]="nodeTopPositions[2]"
        >
          <div class="glass-node">
            <span class="node-number">03</span>
            <h3 class="font-playfair text-gradient" data-edit-id="about.node3.title" data-edit-label="About Node 3 Title">{{ lang.translateEditable('about.node3.title', 'about.nodes.2.title') }}</h3>
            <p class="theme-text mb-0" data-edit-id="about.node3.desc" data-edit-label="About Node 3 Description" data-edit-type="textarea">
              {{ lang.translateEditable('about.node3.desc', 'about.nodes.2.desc') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .font-playfair {
        font-family: var(--font-display);
      }
      .text-gradient {
        background: linear-gradient(135deg, #f57c00 0%, #d32f2f 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .timeline-section {
        position: relative;
        background-color: var(--bg-primary);
        height: 430vh;
        scroll-margin-top: 110px;
        transition: background-color 0.5s ease;
      }

      .sticky-viewport {
        position: sticky;
        top: 0;
        height: 100svh;
        min-height: 100vh;
        width: 100%;
        overflow: visible;
        background-color: var(--bg-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.5s ease;
      }

      .bg-typography {
        position: absolute;
        top: 50%;
        left: 10%;
        font-family: var(--font-display);
        font-size: 35vw;
        font-weight: 900;
        color: var(--border-color);
        white-space: nowrap;
        pointer-events: none;
        z-index: 1;
      }
      .text-outline {
        color: transparent;
        -webkit-text-stroke: 2px var(--border-color);
      }

      /* Intro Header */
      .header-content {
        position: absolute;
        top: clamp(230px, 24vh, 280px);
        text-align: center;
        z-index: 10;
        transition: opacity 0.3s;
        width: min(720px, calc(100% - 48px));
      }
      .eyebrow {
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 4px;
        font-size: 0.8rem;
        font-weight: 700;
      }

      /* The Pipeline */
      .pipeline-track {
        position: absolute;
        top: 10vh;
        bottom: 10vh;
        left: 50%;
        width: 4px;
        transform: translateX(-50%);
        background: var(--border-color);
        border-radius: 4px;
        z-index: 5;
      }
      .pipeline-fill {
        width: 100%;
        background: linear-gradient(180deg, #f57c00, #d32f2f);
        border-radius: 4px;
        box-shadow: 0 0 20px #f57c00;
      }

      /* Target Roller */
      .tracker-container {
        position: absolute;
        left: 50%;
        z-index: 20;
        transform: translateX(-50%);
      }
      .tracker-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: rgba(245, 178, 0, 0.32);
        filter: blur(40px);
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease-out;
      }
      .tracker-img {
        position: absolute;
        top: -90px;
        left: -90px;
        width: 180px;
        height: 180px;
        object-fit: contain;
        transform-origin: center;
      }

      /* Narrative Nodes */
      .node-content {
        position: absolute;
        width: 35vw;
        max-width: 450px;
        z-index: 15;
        opacity: 0;
        pointer-events: none;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      :host-context(body.editor-preview) .header-content,
      :host-context(body.editor-preview) .node-content.active,
      :host-context(body.editor-preview) .glass-node,
      :host-context(body.editor-preview) .glass-node [data-edit-id] {
        pointer-events: auto;
      }
      .node-left {
        left: 10%;
        transform: translateX(-40px);
      }
      .node-right {
        right: 10%;
        transform: translateX(40px);
      }
      .node-content.active {
        opacity: 1;
        transform: translateX(0);
      }

      .glass-node {
        background: var(--glass-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        --node-number-space: 5.75rem;
        padding: 2.5rem;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
      }
      .theme-text {
        color: var(--text-primary);
      }
      .node-number {
        position: absolute;
        top: 1rem;
        right: 1.35rem;
        font-size: 5rem;
        font-family: var(--font-display);
        font-weight: 900;
        color: var(--border-color);
        line-height: 1;
        opacity: 0.35;
        pointer-events: none;
      }

      .glass-node h3,
      .glass-node p {
        position: relative;
        z-index: 1;
        width: 100%;
        box-sizing: border-box;
        padding-right: var(--node-number-space);
      }

      .glass-node p {
        color: var(--text-secondary);
        line-height: 1.6;
        overflow-wrap: anywhere;
        text-wrap: pretty;
      }

      :host-context([dir='rtl']) .node-number {
        left: 1.35rem;
        right: auto;
      }

      :host-context([dir='rtl']) .glass-node h3,
      :host-context([dir='rtl']) .glass-node p {
        padding-left: var(--node-number-space);
        padding-right: 0;
      }

      @media (max-width: 991px) {
        .pipeline-track {
          left: 12%;
        }
        .tracker-container {
          left: 12%;
        }
        .tracker-img {
          width: 130px;
          height: 130px;
          top: -65px;
          left: -65px;
        }
        .tracker-glow {
          width: 110px;
          height: 110px;
        }
        .node-content {
          width: 70%;
          max-width: 380px;
        }
        .node-left,
        .node-right {
          left: 24%;
          transform: translateX(12px);
        }
        .glass-node {
          --node-number-space: 4.5rem;
          padding: 1.5rem;
        }
        .node-number {
          font-size: 4rem;
          top: 0.9rem;
          right: 1rem;
        }
        :host-context([dir='rtl']) .node-number {
          left: 1rem;
        }
        .display-3 {
          font-size: 2.8rem;
        }
        .bg-typography {
          display: none;
        }

        .timeline-section {
          height: 400vh;
        }
      }

      @media (max-width: 576px) {
        .timeline-section {
          height: 390vh;
        }

        .header-content {
          top: 24%;
          width: calc(100% - 28px);
        }

        .pipeline-track {
          top: 14vh;
          bottom: 8vh;
          left: 24px;
        }
        .tracker-container {
          left: 24px;
        }
        .tracker-img {
          width: 78px;
          height: 78px;
          top: -39px;
          left: -39px;
        }
        .tracker-glow {
          width: 78px;
          height: 78px;
          filter: blur(28px);
        }
        .node-left,
        .node-right {
          left: 64px;
          transform: translateX(10px);
        }
        .node-content {
          width: calc(100% - 84px);
          max-width: none;
        }
        .glass-node {
          border-radius: 16px;
          --node-number-space: 3.5rem;
          padding: 1.15rem;
        }
        .node-number {
          top: 0.75rem;
          right: 0.85rem;
          font-size: 3.2rem;
        }
        :host-context([dir='rtl']) .node-number {
          left: 0.85rem;
        }
        .display-3 {
          font-size: 2.25rem;
        }
        .eyebrow {
          letter-spacing: 3px;
          font-size: 0.72rem;
        }
        h3 {
          font-size: 1.12rem;
        }
        p {
          font-size: 0.84rem;
          line-height: 1.55;
        }
      }
    `,
  ],
})
export class AboutComponent implements AfterViewInit {
  @ViewChild('timelineSection') section!: ElementRef<HTMLElement>;
  lang = inject(LanguageService);

  scrollProgress = 0;
  trackerScale = 1;
  trackerTop = '10vh';

  orangeOpacity = 1;
  kiwiOpacity = 0;
  strawberryOpacity = 0;
  nodeTopPositions = [24, 50, 66];

  private rectTop = 0;
  private rectHeight = 0;

  ngAfterViewInit() {
    // Small delay to ensure the DOM has settled for sticky bound calculations
    setTimeout(() => {
      this.updateBounds();
    }, 600);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateBounds();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.rectHeight) return;

    // Track scroll globally across the entire 400vh section bounds
    const scrollY = window.scrollY;
    // How far we've scrolled into the section
    const rawProgress = (scrollY - this.rectTop) / (this.rectHeight - window.innerHeight);
    this.scrollProgress = Math.max(0, Math.min(1, rawProgress));
    this.updateTrackerTop();

    // Calculate node popping physics
    const d1 = Math.max(0, 1 - Math.abs(this.scrollProgress - 0.25) * 15);
    const d2 = Math.max(0, 1 - Math.abs(this.scrollProgress - 0.52) * 15);
    const d3 = Math.max(0, 1 - Math.abs(this.scrollProgress - 0.74) * 15);
    this.trackerScale = 1 + (d1 + d2 + d3) * 0.4; // swells fruit size when passing a node

    // Image morphing transitions based on scroll depth
    if (this.scrollProgress < 0.35) {
      this.orangeOpacity = 1;
      this.kiwiOpacity = 0;
      this.strawberryOpacity = 0;
    } else if (this.scrollProgress < 0.45) {
      // Crossfade Orange -> Kiwi
      const t = (this.scrollProgress - 0.35) * 10;
      this.orangeOpacity = 1 - t;
      this.kiwiOpacity = t;
      this.strawberryOpacity = 0;
    } else if (this.scrollProgress < 0.65) {
      this.orangeOpacity = 0;
      this.kiwiOpacity = 1;
      this.strawberryOpacity = 0;
    } else if (this.scrollProgress < 0.75) {
      // Crossfade Kiwi -> Apple/Strawberry
      const t = (this.scrollProgress - 0.65) * 10;
      this.orangeOpacity = 0;
      this.kiwiOpacity = 1 - t;
      this.strawberryOpacity = t;
    } else {
      this.orangeOpacity = 0;
      this.kiwiOpacity = 0;
      this.strawberryOpacity = 1;
    }
  }

  private updateBounds() {
    this.nodeTopPositions =
      window.innerWidth <= 576 ? [25, 50, 62] : window.innerWidth <= 991 ? [24, 50, 64] : [24, 50, 66];

    const rect = this.section.nativeElement.getBoundingClientRect();
    this.rectTop = rect.top + window.scrollY;
    this.rectHeight = rect.height;
    this.updateTrackerTop();
  }

  private updateTrackerTop() {
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 576;
    const isTablet = window.innerWidth <= 991;
    const topOffset = viewportHeight * (isMobile ? 0.14 : 0.1);
    const bottomOffset = viewportHeight * (isMobile ? 0.08 : 0.1);
    const trackerHalfSize = isMobile ? 39 : isTablet ? 65 : 90;
    const edgePadding = isMobile ? 12 : 18;
    const start = Math.max(topOffset, trackerHalfSize + edgePadding);
    const end = Math.min(
      viewportHeight - bottomOffset,
      viewportHeight - trackerHalfSize - edgePadding,
    );
    const travel = Math.max(0, end - start);

    this.trackerTop = `${start + this.scrollProgress * travel}px`;
  }
}
