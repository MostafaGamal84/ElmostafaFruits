import { Component, HostListener, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimationService } from '../../core/services/animation.service';
import { LanguageService } from '../../core/services/language.service';
import { SiteContentService } from '../../core/services/site-content.service';

interface FloatingFruit {
  imgSrc: string;
  label: string;
  left: string;
  top: string;
  duration: string;
  delay: string;
  speedMultiplier: number;
  translateY: number;
  size: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section" id="home">
      <!-- Glowing Mouse Tracker Orb -->
      <div
        class="hero-orb"
        [style.transform]="'translate(' + mouseX() + 'px, ' + mouseY() + 'px)'"
      ></div>

      <!-- Floating Parallax Real Fruits -->
      <div class="fruits-layer">
        <div
          *ngFor="let fruit of floatingFruits; let i = index"
          class="floating-fruit"
          [style.left]="fruit.left"
          [style.top]="fruit.top"
          [style.width]="fruit.size"
          [style.height]="fruit.size"
          [style.animation-duration]="fruit.duration"
          [style.animation-delay]="fruit.delay"
          [style.transform]="'translateY(' + fruit.translateY + 'px)'"
        >
          <img
            [src]="fruit.imgSrc"
            class="real-fruit"
            [attr.data-edit-id]="'hero.fruit.' + i"
            [attr.data-edit-label]="'Hero Floating ' + fruit.label"
            data-edit-type="image"
            data-edit-scope="global"
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="container hero-content">
        <div class="hero-text-wrapper stagger-item">
          <span
            class="eyebrow glass-panel"
            data-edit-id="hero.eyebrow"
            data-edit-label="Hero Eyebrow"
            [attr.data-edit-scope]="lang.currentLang()"
          >
            {{ content.getHeroValue('eyebrow', lang.currentLang()) }}
          </span>
        </div>
        <div class="hero-title-wrapper stagger-item">
          <!-- Outline Title (Background Parallax) -->
          <div class="hero-title-outline-container" [style.transform]="getOutlineTransform()">
            <span
              *ngFor="let char of titleChars(); let i = index"
              class="char-outline"
              [style.transition-delay]="i * 0.05 + 's'"
            >
              {{ char }}
            </span>
          </div>

          <!-- Solid Title (Main) -->
          <h1
            class="hero-title"
            data-edit-id="hero.title"
            data-edit-label="Hero Title"
            [attr.data-edit-scope]="lang.currentLang()"
          >
            <span
              *ngFor="let char of titleChars(); let i = index"
              class="char-solid"
              [style.transition-delay]="i * 0.05 + 's'"
              [style.--letter-index]="i"
              [style.transform]="getCharTransform(i)"
            >
              {{ char }}
            </span>
          </h1>
        </div>
        <div class="hero-subtitle-wrapper stagger-item">
          <p
            class="hero-subtitle"
            data-edit-id="hero.subtitle"
            data-edit-label="Hero Subtitle"
            data-edit-type="textarea"
            [attr.data-edit-scope]="lang.currentLang()"
          >
            {{ content.getHeroValue('subtitle', lang.currentLang()) }}
          </p>
        </div>
        <div class="hero-cta-wrapper stagger-item">
          <button
            class="btn btn-primary cta-button glow-border"
            (click)="scrollToProducts()"
            data-edit-id="hero.cta"
            data-edit-label="Hero CTA"
            [attr.data-edit-scope]="lang.currentLang()"
          >
            <span style="position:relative; z-index:2">{{
              content.getHeroValue('cta', lang.currentLang())
            }}</span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero-section {
        height: 100vh;
        width: 100%;
        background-color: var(--bg-primary);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.5s ease;
      }
      .hero-orb {
        position: absolute;
        top: -200px;
        left: -200px;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(245, 124, 0, 0.15) 0%, rgba(245, 124, 0, 0) 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        will-change: transform;
      }
      .hero-content {
        position: relative;
        z-index: 10;
        text-align: center;
        color: var(--text-primary);
      }

      :host-context(body.editor-preview) .hero-content {
        pointer-events: none;
      }

      .hero-content > * {
        pointer-events: auto;
      }

      .eyebrow {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 4px;
        color: var(--color-primary);
        margin-bottom: 2rem;
        display: inline-block;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 30px;
      }
      .hero-title-wrapper {
        position: relative;
        perspective: 1000px;
        margin: 2rem 0;
      }
      .hero-title {
        font-family: var(--font-display);
        font-size: clamp(3rem, 10vw, 9rem);
        font-weight: 900;
        line-height: 0.95;
        margin: 0;
        position: relative;
        text-transform: uppercase;
        color: var(--text-primary);
        display: flex;
        justify-content: center;
        gap: 0.1em;
        z-index: 10;
        direction: ltr;
      }
      :host-context([dir='rtl']) .hero-title {
        gap: 0;
        direction: rtl;
      }
      .char-solid {
        display: inline-block;
        transition:
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 1s ease;
        animation: charReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
        filter: blur(10px);
        transform: translateY(40px) rotateX(-45deg);
        position: relative;
        isolation: isolate;
      }
      @keyframes charReveal {
        to {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0) rotateX(0);
        }
      }

      .hero-title-outline-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -40%);
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 0.1em;
        font-family: var(--font-display);
        font-size: clamp(3.5rem, 11vw, 10rem);
        font-weight: 900;
        text-transform: uppercase;
        pointer-events: none;
        z-index: 1;
        opacity: 1;
        direction: ltr;
      }
      :host-context([dir='rtl']) .hero-title-outline-container {
        gap: 0;
        direction: rtl;
      }
      .char-outline {
        display: inline-block;
        color: transparent;
        -webkit-text-stroke: 1px rgba(255, 255, 255, 0.08);
        opacity: 0;
        filter: blur(2px);
        transform: translateY(10px) scale(1.02);
        animation: outlineSoftFade 5.5s ease-in-out infinite;
      }

      @keyframes outlineSoftFade {
        0%,
        100% {
          opacity: 0.04;
          filter: blur(3px);
        }
        45%,
        65% {
          opacity: 0.16;
          filter: blur(1.2px);
        }
      }

      .char-solid::before {
        content: '';
        position: absolute;
        top: -12%;
        left: -46%;
        width: 58%;
        height: 124%;
        background: linear-gradient(
          100deg,
          transparent 0%,
          rgba(255, 255, 255, 0.03) 18%,
          rgba(255, 255, 255, 0.18) 48%,
          rgba(255, 255, 255, 0.04) 78%,
          transparent 100%
        );
        opacity: 0;
        filter: blur(4px);
        transform: translateX(-12px) skewX(-18deg);
        animation: letterTrailFade 4.8s ease-in-out infinite;
        animation-delay: calc(var(--letter-index, 0) * 0.08s);
        pointer-events: none;
        z-index: -1;
      }

      .char-solid::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 38%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 62%
        );
        opacity: 0;
        transform: translateX(-120%) skewX(-18deg);
        animation: shimmerLetterFade 7s ease-in-out infinite;
        animation-delay: calc(var(--letter-index, 0) * 0.05s);
        pointer-events: none;
      }

      @keyframes letterTrailFade {
        0%,
        62%,
        100% {
          opacity: 0;
          transform: translateX(-12px) skewX(-18deg);
        }
        72% {
          opacity: 0.48;
        }
        88% {
          opacity: 0;
          transform: translateX(20px) skewX(-18deg);
        }
      }

      @keyframes shimmerLetterFade {
        0%,
        74%,
        100% {
          opacity: 0;
          transform: translateX(-130%) skewX(-18deg);
        }
        84% {
          opacity: 0.22;
        }
        94% {
          opacity: 0;
          transform: translateX(130%) skewX(-18deg);
        }
      }

      .hero-subtitle {
        font-size: clamp(1rem, 2vw, 1.25rem);
        max-width: 600px;
        margin: 1.5rem auto;
        color: var(--text-secondary);
        line-height: 1.6;
      }
      .cta-button {
        padding: 1rem 3rem;
        font-size: 1rem;
        letter-spacing: 1.5px;
        background: var(--color-primary);
        border: none;
        border-radius: 50px;
        color: #fff;
        font-weight: 600;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cta-button:hover {
        transform: translateY(-5px) scale(1.05);
        background: #f57c00;
        box-shadow: 0 15px 30px rgba(245, 124, 0, 0.4);
      }

      /* Floating Real Fruits */
      .fruits-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 3;
        pointer-events: none;
      }
      .floating-fruit {
        position: absolute;
        opacity: 0.46;
        animation: floatFruit infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      .real-fruit {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: blur(0.7px) contrast(1.08) brightness(0.92) saturate(0.95);
      }

      @keyframes floatFruit {
        0% {
          transform: translateY(0) rotate(0deg);
        }
        100% {
          transform: translateY(-40px) rotate(20deg);
        }
      }
    `,
  ],
})
export class HeroComponent implements OnInit {
  floatingFruits: FloatingFruit[] = [];
  private animationService = inject(AnimationService);
  private readonly router = inject(Router);
  lang = inject(LanguageService);
  content = inject(SiteContentService);

  mouseX = () => this.animationService.laggingPosition().x;
  mouseY = () => this.animationService.laggingPosition().y;

  titleChars = computed(() => {
    const title = this.content.getHeroValue('title', this.lang.currentLang());
    return this.lang.currentLang() === 'ar'
      ? [title]
      : title.split('').map((char) => (char === ' ' ? '\u00A0' : char));
  });

  titleX = computed(() => (this.mouseX() - window.innerWidth / 2) * 0.015);
  titleY = computed(() => (this.mouseY() - window.innerHeight / 2) * 0.015);

  ngOnInit() {
    this.floatingFruits = [
      {
        imgSrc: 'assets/real-apple.png',
        label: 'Red apple',
        left: '16%',
        top: '18%',
        duration: '9s',
        delay: '-1s',
        speedMultiplier: 0.22,
        translateY: 0,
        size: 'clamp(90px, 6.5vw, 130px)',
      },
      {
        imgSrc: 'assets/real-kiwi.png',
        label: 'Kiwi',
        left: '86%',
        top: '15%',
        duration: '10s',
        delay: '-2s',
        speedMultiplier: 0.16,
        translateY: 0,
        size: 'clamp(78px, 5.5vw, 108px)',
      },
      {
        imgSrc: 'assets/real-banana-cutout.png',
        label: 'Bananas',
        left: '19%',
        top: '68%',
        duration: '8.5s',
        delay: '-0.5s',
        speedMultiplier: 0.28,
        translateY: 0,
        size: 'clamp(115px, 8vw, 165px)',
      },
      {
        imgSrc: 'assets/real-avocado-cutout.png',
        label: 'Avocado',
        left: '76%',
        top: '60%',
        duration: '9.5s',
        delay: '-1.5s',
        speedMultiplier: 0.2,
        translateY: 0,
        size: 'clamp(95px, 6.8vw, 135px)',
      },
      {
        imgSrc: 'assets/real-pineapple-cutout.png',
        label: 'Pineapple',
        left: '62%',
        top: '76%',
        duration: '11s',
        delay: '-3s',
        speedMultiplier: 0.24,
        translateY: 0,
        size: 'clamp(120px, 8vw, 170px)',
      },
    ];
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollY = window.scrollY;
    this.floatingFruits.forEach((fruit) => {
      fruit.translateY = scrollY * fruit.speedMultiplier;
    });
  }

  getCharTransform(index: number) {
    const x = this.titleX() * (1 + (index % 3) * 0.2);
    const y = this.titleY() * (1 + (index % 2) * 0.2);
    return `translate(${x}px, ${y}px)`;
  }

  getOutlineTransform() {
    const x = -50 + this.titleX() * -0.5;
    const y = -40 + this.titleY() * -0.5;
    return `translate(${x}%, ${y}%)`;
  }

  scrollToProducts() {
    this.router.navigateByUrl('/catalog');
  }
}
