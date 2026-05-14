import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

interface Particle {
  id: number;
  type: 'piece';
  imgSrc: string;
  angle: number;
  velocity: number;
  rotation: number;
  scaleMult: number;
  zDepth: number;
  currentX: number;
  currentY: number;
  currentRot: number;
  currentBlur: number;
  currentOpacity: number;
  currentScale: number;
}

@Component({
  selector: 'app-fruit-slice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="slice-section" id="process" #sliceSection>
      <div class="sticky-container">
        <!-- Shockwave Glow -->
        <div
          class="shockwave"
          [style.opacity]="shockwaveOpacity"
          [style.transform]="'scale(' + revealScale + ')'"
        ></div>

        <!-- Text revealed inside the fruit -->
        <div
          class="reveal-content"
          [style.opacity]="revealOpacity"
          [style.transform]="'scale(' + revealScale + ')'"
        >
          <h2
            class="display-3 font-playfair font-weight-bold text-gradient"
            data-edit-id="slice.title"
            data-edit-label="Slice Title"
            data-edit-type="textarea"
            [style.letterSpacing.px]="revealLetterSpacing"
          >
            {{ sliceTitle() }}
          </h2>
          <p
            class="theme-text"
            data-edit-id="slice.subtitle"
            data-edit-label="Slice Subtitle"
            data-edit-type="textarea"
          >
            {{ lang.translate('slice.subtitle') }}
          </p>
        </div>

        <!-- The Fruit Halves wrapped in tension container -->
        <div
          class="tension-wrapper"
          [style.transform]="
            'translate(' +
            tensionShakeX +
            'px, ' +
            tensionShakeY +
            'px) scale(' +
            tensionScale +
            ')'
          "
        >
          <div class="fruit-container">
            <div
              class="fruit-half fruit-top"
              [style.transform]="
                'translate(' +
                topTranslateX +
                'px, ' +
                topTranslateY +
                'px) scale(' +
                topScale +
                ') rotate(' +
                topRotate +
                'deg)'
              "
            >
              <img
                [src]="sliceFruitSrc"
                class="fruit-visual"
                alt="Avocado top half"
                data-edit-id="slice.image.top"
                data-edit-label="Slice Top Image"
                data-edit-type="image"
                data-edit-scope="global"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              class="fruit-half fruit-bottom"
              [style.transform]="
                'translate(' +
                bottomTranslateX +
                'px, ' +
                bottomTranslateY +
                'px) scale(' +
                bottomScale +
                ') rotate(' +
                bottomRotate +
                'deg)'
              "
            >
              <img
                [src]="sliceFruitSrc"
                class="fruit-visual bottom-visual"
                alt="Avocado bottom half"
                data-edit-id="slice.image.bottom"
                data-edit-label="Slice Bottom Image"
                data-edit-type="image"
                data-edit-scope="global"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              class="slice-glint"
              [style.opacity]="sliceLineOpacity"
              [style.transform]="
                'translate(-50%, -50%) rotate(-8deg) scaleX(' + sliceLineScale + ')'
              "
            ></div>
          </div>
        </div>

        <!-- Dynamic Depth-of-Field Particles -->
        <div
          *ngFor="let p of particles"
          class="particle"
          [ngClass]="p.type"
          [style.transform]="
            'translate(' +
            p.currentX +
            'px, ' +
            p.currentY +
            'px) rotate(' +
            p.currentRot +
            'deg) scale(' +
            p.currentScale +
            ')'
          "
          [style.filter]="'contrast(1.18) saturate(1.12) brightness(1.04)'"
          [style.opacity]="p.currentOpacity"
        >
          <img [src]="p.imgSrc" alt="" loading="lazy" decoding="async" aria-hidden="true" />
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .font-playfair {
        font-family: var(--font-display);
        font-weight: 900;
      }
      .text-gradient {
        background: linear-gradient(135deg, #f57c00 0%, #d32f2f 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        white-space: pre-line;
        will-change: letter-spacing;
        transition: letter-spacing 0.1s linear;
      }
      .reveal-content h2 {
        font-size: clamp(2rem, 5.1vw, 4.9rem);
        line-height: 0.95;
      }
      .slice-section {
        height: 300vh;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        position: relative;
        scroll-margin-top: 112px;
        transition: background-color 0.5s ease;
      }
      .sticky-container {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-primary);
        transition: background-color 0.5s ease;
      }

      .theme-text {
        color: var(--text-primary);
        font-size: 1.25rem;
        font-weight: 300;
      }

      .shockwave {
        position: absolute;
        z-index: 5;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(166, 214, 88, 0.42) 0%, rgba(166, 214, 88, 0) 70%);
        mix-blend-mode: screen;
        will-change: opacity, transform;
        pointer-events: none;
      }

      .reveal-content {
        position: absolute;
        text-align: center;
        z-index: 10;
        max-width: 600px;
        padding: 0 2rem;
        will-change: transform, opacity;
        pointer-events: none;
      }

      :host-context(body.editor-preview) .reveal-content {
        pointer-events: auto;
      }

      :host-context(body.editor-preview) .reveal-content [data-edit-id] {
        pointer-events: auto;
      }

      .tension-wrapper {
        position: relative;
        z-index: 20;
      }

      .fruit-container {
        position: relative;
        width: clamp(230px, 24vw, 330px);
        height: clamp(340px, 36vw, 480px);
        pointer-events: none;
        filter: contrast(1.08) brightness(1.04) saturate(1.04);
      }
      .fruit-half {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        will-change: transform;
      }
      .fruit-top {
        clip-path: polygon(0 0, 100% 0, 100% 44%, 0 55%);
        transform-origin: 52% 48%;
      }
      .fruit-bottom {
        clip-path: polygon(0 55%, 100% 44%, 100% 100%, 0 100%);
        transform-origin: 48% 52%;
      }
      .fruit-visual {
        width: 100%;
        height: 100%;
        object-fit: contain;
        position: absolute;
      }
      .fruit-top .fruit-visual {
        inset: 0;
      }
      .fruit-bottom .fruit-visual {
        inset: 0;
      }

      .slice-glint {
        position: absolute;
        top: 49.5%;
        left: 50%;
        z-index: 28;
        width: 112%;
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(221, 255, 165, 0.12) 12%,
          rgba(255, 255, 235, 0.95) 48%,
          rgba(166, 214, 88, 0.58) 68%,
          transparent 100%
        );
        box-shadow:
          0 0 14px rgba(221, 255, 165, 0.55),
          0 0 30px rgba(120, 185, 54, 0.35);
        pointer-events: none;
        transform-origin: center;
        will-change: opacity, transform;
      }

      .particle {
        position: absolute;
        z-index: 25;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
      }
      .particle img {
        object-fit: contain;
        image-rendering: auto;
        transform: translateZ(0);
      }

      .particle.piece img {
        width: clamp(58px, 7vw, 112px);
        height: clamp(58px, 7vw, 112px);
        filter: contrast(1.08) saturate(1.06) brightness(1.03);
      }
    `,
  ],
})
export class FruitSliceComponent implements OnInit, AfterViewInit {
  @ViewChild('sliceSection') section!: ElementRef<HTMLElement>;
  lang = inject(LanguageService);
  readonly sliceTitle = () => this.normalizeLegacyLineBreaks(this.lang.translate('slice.title'));
  readonly sliceFruitSrc = 'assets/real-avocado-slice-fruit.png';

  // Fruit 2D Translation vars
  topTranslateX = 0;
  topTranslateY = 0;
  topScale = 1;
  topRotate = 0;

  bottomTranslateX = 0;
  bottomTranslateY = 0;
  bottomScale = 1;
  bottomRotate = 0;

  // Tension & Text Vars
  tensionShakeX = 0;
  tensionShakeY = 0;
  tensionScale = 1;
  revealOpacity = 0;
  revealScale = 0.8;
  revealLetterSpacing = 0;
  shockwaveOpacity = 0;
  sliceLineOpacity = 0;
  sliceLineScale = 0;

  particles: Particle[] = [];
  private readonly avocadoPiecesSrc = 'assets/real-avocado-pieces.png';

  private boundingTop = 0;
  private boundingHeight = 0;

  ngOnInit() {
    this.initParticles();
  }

  initParticles() {
    for (let i = 0; i < 9; i++) {
      this.particles.push({
        id: i,
        type: 'piece',
        imgSrc: this.avocadoPiecesSrc,
        angle: Math.random() * Math.PI * 2, // 360 spread
        velocity: 120 + Math.random() * 340,
        rotation: -200 + Math.random() * 400, // Spin
        scaleMult: 0.45 + Math.random() * 0.8,
        zDepth: Math.random(), // Generates blur
        currentX: 0,
        currentY: 0,
        currentRot: 0,
        currentBlur: 0,
        currentOpacity: 0,
        currentScale: 0,
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateBounds();
    }, 500);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateBounds();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.boundingHeight) return;

    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const stickyStart = this.boundingTop;
    const stickyEnd = this.boundingTop + this.boundingHeight - windowH;

    if (scrollY < stickyStart) {
      this.resetAnimations();
    } else if (scrollY >= stickyStart && scrollY <= stickyEnd) {
      const progress = (scrollY - stickyStart) / (stickyEnd - stickyStart);
      this.calculateAnimations(progress);
    } else {
      this.calculateAnimations(1);
    }
  }

  private updateBounds() {
    const rect = this.section.nativeElement.getBoundingClientRect();
    this.boundingTop = rect.top + window.scrollY;
    this.boundingHeight = rect.height;
    this.onScroll();
  }

  private calculateAnimations(progress: number) {
    if (progress < 0.15) {
      // Phase 1: TENSION
      const shakeIntensity = (progress / 0.15) * 6; // max 6px distortion
      this.tensionShakeX = Math.sin(progress * 250) * shakeIntensity;
      this.tensionShakeY = Math.cos(progress * 300) * shakeIntensity;
      this.tensionScale = 1 - progress * 0.4; // compresses to ~0.94

      this.topTranslateY = 0;
      this.topTranslateX = 0;
      this.topScale = 1;
      this.topRotate = 0;
      this.bottomTranslateY = 0;
      this.bottomTranslateX = 0;
      this.bottomScale = 1;
      this.bottomRotate = 0;

      this.revealOpacity = 0;
      this.revealScale = 0.8;
      this.revealLetterSpacing = 0;
      this.shockwaveOpacity = 0;
      this.sliceLineOpacity = progress > 0.08 ? (progress - 0.08) / 0.07 : 0;
      this.sliceLineScale = progress > 0.08 ? Math.min((progress - 0.08) / 0.05, 1) : 0;

      this.calculateParticles(0);
    } else {
      // Phase 2: SNAP & REVEAL
      const snapProgress = (progress - 0.15) / 0.85; // 0 to 1
      const ease = 1 - Math.pow(1 - snapProgress, 4); // Quartic Ease Out

      this.tensionShakeX = 0;
      this.tensionShakeY = 0;
      this.tensionScale = 1;

      // 2D Diagonal Splitting Simulation
      this.topTranslateX = -(ease * 46);
      this.topTranslateY = -(ease * 260);
      this.topScale = 1 - ease * 0.32; // Moves into screen visually
      this.topRotate = ease * -12; // Tilts

      this.bottomTranslateX = ease * 46;
      this.bottomTranslateY = ease * 265;
      this.bottomScale = 1 + ease * 0.18; // Moves towards camera visually
      this.bottomRotate = ease * 12;

      // Visual Glow and Text Effects
      this.shockwaveOpacity = ease > 0.4 ? 1 - (ease - 0.4) * 1.6 : ease * 2.5;
      this.sliceLineOpacity = ease < 0.36 ? 1 - ease / 0.36 : 0;
      this.sliceLineScale = 1 + ease * 0.18;
      this.revealOpacity = ease * 1.5 > 1 ? 1 : ease * 1.5;
      this.revealScale = 0.8 + ease * 0.2;
      this.revealLetterSpacing = ease * 5; // Dynamic cinematic tracking

      this.calculateParticles(ease);
    }
  }

  private calculateParticles(ease: number) {
    this.particles.forEach((p) => {
      if (ease === 0) {
        p.currentOpacity = 0;
        return;
      }
      const dist = p.velocity * ease;
      p.currentX = Math.cos(p.angle) * dist;
      p.currentY = Math.sin(p.angle) * dist;
      p.currentRot = p.rotation * ease;
      p.currentScale = p.scaleMult * (0.3 + ease * 0.7);

      // Opacity peaks instantly then fades out
      p.currentOpacity = ease > 0.7 ? 1 - (ease - 0.7) * 3.3 : ease * 3 > 1 ? 1 : ease * 3;
      p.currentBlur = 0;
    });
  }

  private resetAnimations() {
    this.calculateAnimations(0);
  }

  private normalizeLegacyLineBreaks(value: string): string {
    return String(value ?? '').replace(/<br\s*\/?>/gi, '\n');
  }
}
