# Frontend Admin Dashboard Spec (Angular)

## 1. الهدف

هذا الملف خاص بالفرونت فقط للـ dashboard داخل مشروع Angular الحالي.

المطلوب:

- الإبقاء على البورتفوليو الحالي كما هو.
- إضافة Admin Dashboard منفصلة.
- تسجيل دخول بالإيميل + verification code.
- Sidebar بنفس الفكرة التي أرسلتها:
  - `Dashboard`
  - `Products`
  - `Site Content`
  - `Visual Editor`
  - `Orders`
  - `Payments`
  - `Messages`
  - `Logout`
- دعم `live edit mode` بحيث نفتح الموقع نفسه لكن بعناصر قابلة للتعديل والحفظ.

## 2. قراءة سريعة للمشروع الحالي

المشروع الحالي:

- Angular standalone
- لا يستخدم router فعلياً حتى الآن: `src/app/app.routes.ts`
- الصفحة الرئيسية مركبة داخل `src/app/app.component.ts`
- البيانات الحالية:
  - `public/assets/data.json`
  - `src/app/core/services/language.service.ts`

الـ sections الحالية الموجودة فعلاً:

- `NavbarComponent`
- `HeroComponent`
- `FruitSliceComponent`
- `MarqueeComponent`
- `AboutComponent`
- `ProductsComponent`
- `OriginsComponent`
- `WhyUsComponent`
- `FooterComponent`

## 3. القرار المعماري المطلوب

لا تبنِ الداشبورد داخل نفس `AppComponent` الحالي.

التركيب الصحيح:

1. تحويل `AppComponent` إلى shell فيه `router-outlet`.
2. إنشاء public route للموقع.
3. إنشاء admin routes مستقلة.

هيكل routes المقترح:

```ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/public-home/public-home.component').then((m) => m.PublicHomeComponent),
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
        path: 'products',
        loadComponent: () =>
          import('./admin/pages/products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
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
        path: 'visual-editor',
        loadComponent: () =>
          import('./admin/pages/visual-editor/admin-visual-editor.component').then(
            (m) => m.AdminVisualEditorComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/pages/orders/admin-orders.component').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./admin/pages/payments/admin-payments.component').then(
            (m) => m.AdminPaymentsComponent,
          ),
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
];
```

## 4. التعديلات المطلوبة على الـ public app

### 4.1 فصل الصفحة الرئيسية

انقل template الحالي من `app.component.ts` إلى:

- `src/app/pages/public-home/public-home.component.ts`

ويكون هو المسؤول عن:

- navbar
- hero
- fruit slice
- marquee
- about
- products
- origins
- why us
- footer

### 4.2 دعم admin login button

في المشروع الأساسي أضف زر `Admin Login` داخل navbar أو footer.

السلوك:

- يفتح `/admin/login`

### 4.3 جعل عناصر الصفحة قابلة للربط مع الـ visual editor

كل عنصر قابل للتعديل يجب أن يحصل على `data-edit-id`.

أمثلة:

```html
<h1 data-edit-id="hero.title">{{ heroTitle }}</h1>
<p data-edit-id="hero.subtitle">{{ heroSubtitle }}</p>
<button data-edit-id="hero.ctaLabel">{{ ctaLabel }}</button>
```

وأيضاً للصور:

```html
<img data-edit-id="hero.backgroundImage" [src]="backgroundImageUrl" />
```

هذا مهم جداً لأن `Visual Editor` سيعتمد على هذه الـ ids.

## 5. هيكل مجلد admin المقترح

```text
src/app/admin/
  core/
    guards/
    interceptors/
    models/
    services/
    store/
  layout/
    admin-layout.component.ts
    admin-sidebar.component.ts
    admin-topbar.component.ts
  pages/
    admin-login/
    dashboard/
    products/
    site-content/
    visual-editor/
    orders/
    payments/
    messages/
  shared/
    components/
    ui/
```

## 6. Login Flow

## 6.1 شاشة الدخول

شاشتين داخل نفس الصفحة:

1. Step 1: إدخال الإيميل
2. Step 2: إدخال verification code

API calls:

- `POST /api/admin/auth/request-code`
- `POST /api/admin/auth/verify-code`

بعد نجاح التحقق:

- حفظ `accessToken`
- حفظ `refreshToken`
- تحميل بيانات `me`
- redirect إلى `/admin/dashboard`

## 6.2 التخزين

يفضل:

- `accessToken` في memory
- `refreshToken` في `httpOnly cookie` لو الباك يدعم ذلك

ولو تم التنفيذ بسرعة في MVP:

- `refreshToken` في `localStorage`

## 6.3 الملفات المطلوبة

- `admin-auth.service.ts`
- `admin-session.service.ts`
- `admin-auth.guard.ts`
- `auth.interceptor.ts`

## 7. شكل الـ Dashboard

## 7.1 Layout

التصميم المطلوب من الصور:

- sidebar ثابتة
- topbar بسيط
- content area واسعة
- dark theme
- accent ذهبي

### Sidebar items

```ts
const sidebarItems = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Products', route: '/admin/products', icon: 'inventory_2' },
  { label: 'Site Content', route: '/admin/site-content', icon: 'edit_note' },
  { label: 'Visual Editor', route: '/admin/visual-editor', icon: 'visibility' },
  { label: 'Orders', route: '/admin/orders', icon: 'shopping_cart' },
  { label: 'Payments', route: '/admin/payments', icon: 'payments' },
  { label: 'Messages', route: '/admin/messages', icon: 'mail' },
];
```

وفي آخر الـ sidebar:

- `View Site`
- `Logout`

## 7.2 Dashboard page

تحتوي على:

- summary cards
  - products count
  - orders count
  - pending orders
  - unread messages
  - total revenue
- recent activity
- quick actions
  - add product
  - edit hero
  - open visual editor

API:

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/recent-activity`

## 8. Products Page

الصفحة تحتوي على:

- search
- grid أو table
- add product button
- edit product modal / drawer
- delete action
- image upload

API:

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`
- `GET /api/admin/origins`
- `POST /api/admin/media`

### Form fields

- `nameEn`
- `nameAr`
- `descriptionEn`
- `descriptionAr`
- `image`
- `categoryKey`
- `originIds`
- `varieties`
- `isFeatured`
- `isPublished`
- `sortOrder`

## 9. Site Content Page

هذا الجزء خاص بالتعديل المنظم.

بدل ما تعدل الصفحة visually، ستجد sections واضحة مثل:

- Navbar
- Hero
- Fruit Slice
- Marquee
- About
- Products Header
- Origins Header
- Why Us
- Footer

### UX المطلوب

- accordion أو cards لكل section
- داخل كل section:
  - حقول عربي
  - حقول إنجليزي
  - حقول صور
  - ترتيب
  - إظهار/إخفاء
- أزرار:
  - `Save Draft`
  - `Save & Publish`

### API

- `GET /api/admin/site-content/pages`
- `GET /api/admin/site-content/pages/{pageKey}/sections/{sectionKey}`
- `PUT /api/admin/site-content/pages/{pageKey}/sections/{sectionKey}`
- `POST /api/admin/site-content/publish`
- `POST /api/admin/site-content/reorder-sections`
- `PATCH /api/admin/site-content/sections/{sectionKey}/visibility`

## 10. Visual Editor Page

هذا هو أهم جزء.

## 10.1 الفكرة

الصفحة تعرض الموقع نفسه داخل preview area، لكن مع طبقة editor فوقه.

التركيب المقترح:

- يسار أو يمين: control panel
- المنتصف: iframe أو embedded preview
- عند الضغط على أي عنصر editable:
  - يتم تحديد العنصر
  - تظهر خصائصه في panel
  - يمكن تعديل النص / الصورة / style

## 10.2 لماذا `iframe` أفضل

يفضل استخدام `iframe` لسببين:

- عزل CSS الخاص بالموقع عن CSS الخاص بالدashboard
- عرض الصفحة كما يراها المستخدم فعلاً

## 10.3 Mechanism

1. dashboard يطلب metadata من:
   - `GET /api/admin/visual-editor/page/home?locale=ar&status=draft`
2. iframe يفتح public page لكن في mode خاص:
   - `/ ?editor=true&locale=ar&status=draft`
3. الصفحة العامة تقرأ query param `editor=true`
4. إذا كان editor mode مفعلاً:
   - تفعيل overlays
   - تفعيل `postMessage`
   - السماح باختيار العناصر التي فيها `data-edit-id`

## 10.4 العقد بين iframe والـ dashboard

### من iframe إلى dashboard

```ts
window.parent.postMessage(
  {
    type: 'editor-node-selected',
    payload: {
      nodeId: 'hero.title',
      value: 'EL MOSTAFA',
      nodeType: 'text',
    },
  },
  '*',
);
```

### من dashboard إلى iframe

```ts
iframe.contentWindow?.postMessage(
  {
    type: 'editor-node-update',
    payload: {
      nodeId: 'hero.title',
      value: 'New Title',
    },
  },
  '*',
);
```

## 10.5 أنواع العناصر القابلة للتعديل

- `text`
- `textarea`
- `rich-text`
- `image`
- `link`
- `button`
- `style`
- `visibility`

## 10.6 مثال تجربة المستخدم

1. يفتح `Visual Editor`
2. يختار اللغة `AR`
3. يضغط على عنوان hero
4. panel تعرض:
   - current value
   - font size
   - color
   - alignment
5. يغير النص
6. التغيير يظهر فوراً في preview
7. يضغط `Save Draft` أو `Save & Publish`

## 10.7 API الخاصة بالـ visual editor

- `GET /api/admin/visual-editor/page/home?locale=ar&status=draft`
- `PATCH /api/admin/visual-editor/nodes/{nodeId}`
- `PATCH /api/admin/visual-editor/styles/{nodeId}`
- `POST /api/admin/visual-editor/save-layout`
- `POST /api/admin/visual-editor/publish`
- `POST /api/admin/media`

## 11. Orders / Payments / Messages

حتى لو الموقع الحالي ليس ecommerce كامل، جهز الواجهة بهذه الصفحات:

### Orders

- table
- search
- filter by status
- quick status update

### Payments

- table
- filter by payment status
- provider
- transaction reference

### Messages

- list
- status tabs
- details drawer
- mark as read

## 12. State Management

المشروع حالياً يستخدم `NgRx` للـ products و origins.

التوصية:

- `NgRx` للبيانات القادمة من API:
  - dashboard summary
  - products
  - origins
  - orders
  - payments
  - messages
  - site-content
- `signals` أو local component state للـ UI state المؤقت:
  - sidebar collapse
  - selected node in visual editor
  - form dirty state
  - iframe selection

## 13. Services المطلوبة

- `admin-auth.service.ts`
- `dashboard-api.service.ts`
- `admin-products-api.service.ts`
- `admin-site-content-api.service.ts`
- `admin-visual-editor-api.service.ts`
- `admin-orders-api.service.ts`
- `admin-payments-api.service.ts`
- `admin-messages-api.service.ts`
- `admin-media-api.service.ts`

## 14. المكونات الأساسية المطلوبة

- `AdminLayoutComponent`
- `AdminSidebarComponent`
- `AdminTopbarComponent`
- `StatCardComponent`
- `SectionEditorCardComponent`
- `MediaPickerComponent`
- `LanguageToggleComponent`
- `VisualEditorToolbarComponent`
- `VisualEditorPropertiesPanelComponent`
- `VisualEditorPreviewComponent`
- `ConfirmDialogComponent`

## 15. الربط مع الموقع الحالي

الموقع الحالي يحتاج 3 تعديلات أساسية فقط ليصبح قابل للإدارة:

1. نقل النصوص الثابتة من `language.service.ts` إلى API-driven content layer.
2. نقل `products` و `origins` من `data.json` إلى API.
3. إضافة `data-edit-id` على العناصر القابلة للتعديل.

## 16. Mapping بين sections الحالية و keys المقترحة

| Current Component          | Page Key | Section Key       |
| -------------------------- | -------- | ----------------- |
| `NavbarComponent`          | `home`   | `navbar`          |
| `HeroComponent`            | `home`   | `hero`            |
| `FruitSliceComponent`      | `home`   | `fruit-slice`     |
| `MarqueeComponent`         | `home`   | `marquee`         |
| `AboutComponent`           | `home`   | `about`           |
| `ProductsComponent` header | `home`   | `products-header` |
| `OriginsComponent` header  | `home`   | `origins-header`  |
| `WhyUsComponent`           | `home`   | `why-us`          |
| `FooterComponent`          | `home`   | `footer`          |

## 17. الأولويات التنفيذية

## Phase 1

- router
- admin login
- admin layout
- dashboard shell
- auth guard
- auth interceptor

## Phase 2

- products CRUD
- origins CRUD
- media upload

## Phase 3

- site content page
- API integration for public content

## Phase 4

- visual editor
- iframe bridge
- live preview
- save/publish

## Phase 5

- orders
- payments
- messages

## 18. ملاحظات مهمة

- استخدم dark admin theme منفصل عن public theme.
- لا تخلط CSS الخاص بالدashboard مع CSS الخاص بالموقع.
- أي عنصر تريد تعديله live لازم يكون له `data-edit-id` ثابت.
- عند الحفظ، واجهة preview يجب أن تتحدث فوراً بدون refresh كامل لو أمكن.
- إذا تم `publish`, يجب عمل refetch أو cache busting للـ public content.
- النصوص العربية والإنجليزية يجب التعامل معها UTF-8 بالكامل.

## 19. MVP واضح وسريع

إذا أردت أسرع نسخة عملية:

1. `admin/login`
2. `admin/dashboard`
3. `admin/products`
4. `admin/site-content`
5. `admin/visual-editor`

وبعدها:

- `orders`
- `payments`
- `messages`

## 20. النتيجة النهائية المطلوبة

بعد التنفيذ، سيكون عندك:

- موقع عام يقرأ المحتوى من API بدل الملفات الثابتة
- Dashboard منفصلة
- Login بالإيميل وكود تحقق
- تعديل منظم عبر `Site Content`
- تعديل حي مباشر عبر `Visual Editor`
- حفظ ثم نشر على الموقع الأساسي
