import { Component } from '@angular/core';
import { AboutUsComponent } from '../about-us/about-us.component';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [NavbarComponent, AboutUsComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="about-page">
      <app-about-us></app-about-us>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      .about-page {
        min-height: 100vh;
        padding-top: 84px;
      }

      @media (max-width: 991px) {
        .about-page {
          padding-top: 70px;
        }
      }

      @media (max-width: 480px) {
        .about-page {
          padding-top: 60px;
        }
      }
    `,
  ],
})
export class AboutPageComponent {}
