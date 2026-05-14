import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/article.model';

type CollectionKey =
  | 'articleCategories'
  | 'articles'
  | 'categories'
  | 'catalogProducts'
  | 'regions'
  | 'milestones'
  | 'stats'
  | 'pages'
  | 'quotes'
  | 'subscribers'
  | 'users';

@Injectable({
  providedIn: 'root',
})
export class AdminMockFallbackService {
  readonly enabled = Boolean(environment.useAdminMockFallback);

  private readonly collections: Record<CollectionKey, any[]> = {
    articleCategories: [
      { id: 1, slug: 'export-insights', name: { en: 'Export Insights', ar: 'رؤى التصدير' } },
      { id: 2, slug: 'crop-notes', name: { en: 'Crop Notes', ar: 'ملاحظات المحاصيل' } },
    ],
    articles: [
      {
        id: 1,
        slug: 'fresh-citrus-export-window',
        title: { en: 'Fresh Citrus Export Window', ar: 'موسم تصدير الموالح' },
        excerpt: {
          en: 'A short operational note about citrus export timing.',
          ar: 'ملاحظة تشغيلية قصيرة عن توقيت تصدير الموالح.',
        },
        body: {
          en: 'Sample article body used while the backend admin endpoints are still in progress.',
          ar: 'محتوى تجريبي للمقال لحين اكتمال نقاط الإدارة في الباك إند.',
        },
        coverImageUrl: 'assets/orange.png',
        categoryId: 1,
        categorySlug: 'export-insights',
        publishedAt: new Date().toISOString(),
        isPublished: true,
      },
    ],
    categories: [
      {
        id: 1,
        slug: 'citrus',
        name: { en: 'Citrus', ar: 'موالح' },
        description: { en: 'Fresh citrus products.', ar: 'منتجات موالح طازجة.' },
        icon: 'orange',
        sortOrder: 1,
        isActive: true,
        productCount: 1,
      },
    ],
    catalogProducts: [
      {
        id: 1,
        categoryId: 1,
        categorySlug: 'citrus',
        slug: 'valencia-orange',
        name: { en: 'Valencia Orange', ar: 'برتقال فالنسيا' },
        shortDescription: { en: 'Export-grade citrus.', ar: 'موالح بجودة تصديرية.' },
        longDescription: { en: 'Sample catalog product.', ar: 'منتج كتالوج تجريبي.' },
        origin: { en: 'Egypt', ar: 'مصر' },
        season: { en: 'Dec - May', ar: 'ديسمبر - مايو' },
        calibers: { en: '48-100', ar: '48-100' },
        packagingDetails: { en: 'Cartons and open top.', ar: 'كراتين وأوبن توب.' },
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
        images: [
          {
            id: 1,
            url: 'assets/orange.png',
            alt: { en: 'Orange', ar: 'برتقال' },
            sortOrder: 1,
            isCover: true,
          },
        ],
      },
    ],
    regions: [
      {
        id: 1,
        slug: 'nile-delta',
        name: { en: 'Nile Delta', ar: 'دلتا النيل' },
        description: { en: 'Key sourcing region.', ar: 'منطقة توريد رئيسية.' },
        latitude: 30.8,
        longitude: 31.0,
        imageUrl: '',
        sortOrder: 1,
        isActive: true,
      },
    ],
    milestones: [
      {
        id: 1,
        year: 2026,
        title: { en: 'Admin Preview', ar: 'معاينة الإدارة' },
        description: { en: 'Temporary milestone data.', ar: 'بيانات مؤقتة للمعاينة.' },
        sortOrder: 1,
      },
    ],
    stats: [
      {
        id: 1,
        key: 'markets',
        label: { en: 'Markets', ar: 'أسواق' },
        value: '12',
        unit: '+',
        icon: 'globe',
        sortOrder: 1,
      },
    ],
    pages: [
      {
        id: 1,
        slug: 'terms',
        title: { en: 'Terms', ar: 'الشروط' },
        body: { en: 'Temporary static page body.', ar: 'محتوى صفحة مؤقت.' },
      },
    ],
    quotes: [
      {
        id: 1,
        fullName: 'Demo Buyer',
        company: 'Demo Import Co.',
        country: 'UAE',
        email: 'buyer@example.com',
        phone: '+971000000',
        quantity: '1 container',
        productId: 1,
        productSlug: 'valencia-orange',
        message: 'Temporary quote request.',
        locale: 'en',
        status: 0,
        createdAt: new Date().toISOString(),
      },
    ],
    subscribers: [
      {
        id: 1,
        email: 'subscriber@example.com',
        locale: 'en',
        isConfirmed: true,
        consentTimestamp: new Date().toISOString(),
      },
    ],
    users: [
      {
        id: 1,
        email: 'admin@local.dev',
        firstName: 'Local',
        lastName: 'Admin',
        fullName: 'Local Admin',
        role: 'Admin',
      },
    ],
  };

  fallback<T>(error: unknown, label: string, valueFactory: () => T): Observable<T> {
    if (!this.enabled) {
      return throwError(() => error);
    }

    console.warn(`[admin mock fallback] ${label}`, error);
    return of(valueFactory());
  }

  list<T>(key: CollectionKey): T[] {
    return this.clone(this.collections[key]);
  }

  paged<T>(key: CollectionKey, page = 1, pageSize = 100): PagedResponse<T> {
    const items = this.collections[key];
    const start = Math.max(0, (page - 1) * pageSize);
    return {
      items: this.clone(items.slice(start, start + pageSize)),
      total: items.length,
      page,
      pageSize,
    };
  }

  create<T>(key: CollectionKey, payload: object): T {
    const item = { id: this.nextId(key), ...payload };
    this.collections[key] = [item, ...this.collections[key]];
    return this.clone(item) as T;
  }

  update<T>(key: CollectionKey, id: string | number, payload: object): T {
    const index = this.collections[key].findIndex((item) => String(item.id) === String(id));
    const next = { ...(this.collections[key][index] ?? { id }), ...payload };

    if (index >= 0) {
      this.collections[key][index] = next;
    } else {
      this.collections[key].unshift(next);
    }

    return this.clone(next);
  }

  delete(key: CollectionKey, id: string | number): void {
    this.collections[key] = this.collections[key].filter((item) => String(item.id) !== String(id));
  }

  addCatalogImage(productId: number, payload: object): any {
    const product = this.collections.catalogProducts.find((item) => item.id === productId);
    const image = { id: Date.now(), ...payload };
    if (product) {
      product.images = [image, ...(product.images ?? [])];
    }
    return this.clone(image);
  }

  deleteCatalogImage(productId: number, imageId: number): void {
    const product = this.collections.catalogProducts.find((item) => item.id === productId);
    if (product) {
      product.images = (product.images ?? []).filter((item: any) => item.id !== imageId);
    }
  }

  getById<T>(key: CollectionKey, id: string | number): T {
    return this.clone(this.collections[key].find((item) => String(item.id) === String(id)));
  }

  private nextId(key: CollectionKey): number {
    return Math.max(0, ...this.collections[key].map((item) => Number(item.id) || 0)) + 1;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
