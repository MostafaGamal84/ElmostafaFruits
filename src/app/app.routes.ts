import { Routes } from '@angular/router';
import { adminAuthGuard } from './admin/core/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/public-home/public-home.component').then((m) => m.PublicHomeComponent),
  },
  {
    path: 'about-us',
    loadComponent: () =>
      import('./pages/about-page/about-page.component').then((m) => m.AboutPageComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog-list/catalog-list.component').then((m) => m.CatalogListComponent),
  },
  {
    path: 'catalog/:slug',
    loadComponent: () =>
      import('./pages/catalog-detail/catalog-detail.component').then((m) => m.CatalogDetailComponent),
  },
  {
    path: 'quote',
    loadComponent: () =>
      import('./pages/quote-form/quote-form.component').then((m) => m.QuoteFormComponent),
  },
  {
    path: 'newsletter/confirm',
    loadComponent: () =>
      import('./pages/newsletter-confirm/newsletter-confirm.component').then(
        (m) => m.NewsletterConfirmComponent,
      ),
  },
  {
    path: 'newsletter/unsubscribe',
    loadComponent: () =>
      import('./pages/newsletter-unsubscribe/newsletter-unsubscribe.component').then(
        (m) => m.NewsletterUnsubscribeComponent,
      ),
  },
  {
    path: 'pages/:slug',
    loadComponent: () =>
      import('./pages/static-page/static-page.component').then((m) => m.StaticPageComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/pages/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./admin/pages/products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'catalog-products',
        loadComponent: () =>
          import('./admin/pages/catalog-products/admin-catalog-products.component').then(
            (m) => m.AdminCatalogProductsComponent,
          ),
      },
      {
        path: 'articles',
        loadComponent: () =>
          import('./admin/pages/articles/admin-articles.component').then(
            (m) => m.AdminArticlesComponent,
          ),
      },
      {
        path: 'categories',
        redirectTo: 'catalog-products',
        pathMatch: 'full',
      },
      {
        path: 'resources',
        loadComponent: () =>
          import('./admin/pages/resources/admin-resources.component').then(
            (m) => m.AdminResourcesComponent,
          ),
      },
      {
        path: 'quotes',
        loadComponent: () =>
          import('./admin/pages/quotes/admin-quotes.component').then(
            (m) => m.AdminQuotesComponent,
          ),
      },
      {
        path: 'newsletter',
        loadComponent: () =>
          import('./admin/pages/newsletter/admin-newsletter.component').then(
            (m) => m.AdminNewsletterComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/pages/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'origins',
        loadComponent: () =>
          import('./admin/pages/origins/admin-origins.component').then(
            (m) => m.AdminOriginsComponent,
          ),
      },
      {
        path: 'site-content',
        loadComponent: () =>
          import('./admin/pages/site-content/admin-site-content.component').then(
            (m) => m.AdminSiteContentComponent,
          ),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./admin/pages/about-us/admin-about-us.component').then(
            (m) => m.AdminAboutUsComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/pages/settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
      {
        path: 'visual-editor',
        loadComponent: () =>
          import('./admin/pages/visual-editor/admin-visual-editor.component').then(
            (m) => m.AdminVisualEditorComponent,
          ),
      },
      {
        path: 'products',
        redirectTo: 'showcase',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'payments',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./admin/pages/messages/admin-messages.component').then(
            (m) => m.AdminMessagesComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
