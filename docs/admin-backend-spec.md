# Admin Backend Spec

## 1. الهدف

هذا الملف هو الـ source of truth المطلوب للباك اند بعد إضافة الـ admin dashboard داخل مشروع `EL-MOSTAFA-PORTFOLIO`.

الهدف من الباك اند:

- استبدال كل الـ mock services الحالية.
- نقل البيانات من `assets/data.json` و `LanguageService` و `MockSiteContentService` إلى API + database.
- دعم تسجيل دخول الأدمن عبر email + verification code.
- دعم `Dashboard`, `Products`, `Site Content`, `Visual Editor`, `Orders`, `Payments`, `Messages`.
- دعم `draft/published` workflow للمحتوى.
- دعم live preview في الـ visual editor اعتمادا على `data-edit-id`.

---

## 2. مراجعة المشروع الحالي

### 2.1 الموجود فعلا في الفرونت

- Angular app فيها public site + admin routes.
- صفحات الأدمن موجودة:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/products`
  - `/admin/site-content`
  - `/admin/visual-editor`
  - `/admin/orders`
  - `/admin/payments`
  - `/admin/messages`
- الـ public site فيه `data-edit-id` markers كثيرة بالفعل، وبالتالي الباك اند لازم يتعامل مع content model حقيقي وليس نصوص ثابتة فقط.

### 2.2 الوضع الحالي قبل ربط الباك اند

- admin auth ما زال mock.
- dashboard data ما زالت mock.
- site content حاليا يكتب في `localStorage`.
- visual editor حاليا يقرأ ويكتب من `localStorage` + DOM overrides.
- products/origins ما زالت تقرأ من `public/assets/data.json`.

### 2.3 ملاحظات مهمة من المراجعة

1. الـ spec القديم لا يطابق الـ node keys الحالية بالكامل.
2. الـ UI الحالي يستخدم فعليا:
   - `slice.*` وليس `fruit-slice.*`
   - `products.*` وليس `products-header.*`
   - `origins.*` وليس `origins-header.*`
3. الـ public site عنده مصدر بيانات مزدوج حاليا:
   - `LanguageService` للنصوص
   - `MockSiteContentService` لبعض النصوص
   - `data.json` للمنتجات والمصادر
   - `MockVisualEditorService` للـ live overrides
4. الـ origin editable nodes حاليا مبنية على اسم الدولة داخل الـ DOM:
   - مثال: `origin.Italy.title`
   - هذا غير مستقر للباك اند
   - التوصية النهائية: تحويلها إلى stable key مثل `origin.{originId}.title` أو `origin.{originSlug}.title`

---

## 3. المصدر النهائي للبيانات

بعد تنفيذ الباك اند، يجب أن تصبح مصادر البيانات كالتالي:

- `products` و `origins` من database tables مباشرة.
- محتوى الصفحة العامة من CMS tables.
- visual editor styles / asset overrides من CMS editor tables.
- dashboard summary من queries حقيقية على الجداول.
- public site يقرأ فقط من public endpoints.

المصادر التالية يجب إزالتها تدريجيا من الـ runtime:

- `public/assets/data.json`
- النصوص الثابتة داخل `LanguageService`
- `MockSiteContentService`
- `MockVisualEditorService`
- `MockAdminDataService`
- `MockAdminAuthService`

---

## 4. المجالات التي يجب أن يخدمها الباك اند

### 4.1 Admin Auth

- إرسال verification code إلى email الأدمن.
- التحقق من الكود.
- إصدار `access token`.
- إصدار `refresh token`.
- جلب بيانات الأدمن الحالي.
- logout / revoke refresh token.

### 4.2 Dashboard

- counters
- recent activity
- revenue summary
- unread messages count

### 4.3 Catalog

- products CRUD
- origins CRUD
- media upload

### 4.4 CMS / Site Content

- إدارة sections للصفحة العامة.
- دعم `draft` و `published`.
- ترتيب sections.
- إظهار / إخفاء sections.
- تخزين النصوص والصور والروابط والقوائم داخل JSON structured content.

### 4.5 Visual Editor

- إرجاع metadata عن كل editable nodes في الصفحة.
- تعديل node value.
- تعديل node styles.
- حفظ draft.
- publish.
- ربط node IDs بالمصدر الحقيقي للبيانات.

### 4.6 CRM / Commerce Readiness

- messages
- orders
- payments

---

## 5. العقد النهائي للـ editable nodes

### 5.1 Static section node families الموجودة حاليا

هذه الـ keys موجودة فعلا أو مشتقة مباشرة من الـ templates الحالية:

- `navbar.logo`
- `navbar.about`
- `navbar.products`
- `navbar.origins`
- `navbar.contact`
- `hero.eyebrow`
- `hero.title`
- `hero.subtitle`
- `hero.cta`
- `hero.fruit.{index}`
- `slice.title`
- `slice.subtitle`
- `slice.image.top`
- `slice.image.bottom`
- `marquee.item.{index}`
- `about.eyebrow`
- `about.title`
- `about.subtitle`
- `about.tracker.orange`
- `about.tracker.kiwi`
- `about.tracker.apple`
- `about.node1.title`
- `about.node1.desc`
- `about.node2.title`
- `about.node2.desc`
- `about.node3.title`
- `about.node3.desc`
- `products.eyebrow`
- `products.title`
- `products.subtitle`
- `origins.eyebrow`
- `origins.title`
- `origins.subtitle`
- `whyUs.eyebrow`
- `whyUs.title`
- `whyUs.subtitle`
- `whyUs.pillar1.title`
- `whyUs.pillar1.desc`
- `whyUs.pillar2.title`
- `whyUs.pillar2.desc`
- `whyUs.pillar3.title`
- `whyUs.pillar3.desc`
- `footer.brandText`
- `footer.description`
- `footer.address`
- `footer.email`
- `footer.phone`

### 5.2 Dynamic entity node families الموجودة حاليا

- `product.{productId}.image`
- `product.{productId}.category`
- `product.{productId}.title`
- `product.{productId}.origin`
- `product.{productId}.variety.{index}`
- `origin.{originStableKey}.flag`
- `origin.{originStableKey}.title`
- `origin.{originStableKey}.product.{index}`

### 5.3 قاعدة مهمة

الـ backend لا يجب أن يعتمد على parsing نصي عشوائي داخل controller.

يجب أن يكون هناك node binding layer واضحة تعرف:

- `nodeId`
- `type`
- `scope`
- `sourceType`
- `sourcePath`
- `pageKey`
- `sectionKey`

---

## 6. الـ APIs المطلوبة

## 6.1 Admin Auth

### `POST /api/admin/auth/request-code`

Request:

```json
{
  "email": "admin@example.com"
}
```

Response:

```json
{
  "success": true,
  "expiresInSeconds": 300,
  "message": "Verification code sent."
}
```

### `POST /api/admin/auth/verify-code`

Request:

```json
{
  "email": "admin@example.com",
  "code": "483921"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "expiresInSeconds": 3600,
  "admin": {
    "id": "2fc04a0d-4f31-4e45-8c5b-8d2e0a5d1c10",
    "email": "admin@example.com",
    "fullName": "Main Admin",
    "role": "SuperAdmin"
  }
}
```

### `POST /api/admin/auth/refresh`

### `POST /api/admin/auth/logout`

### `GET /api/admin/auth/me`

---

## 6.2 Dashboard

### `GET /api/admin/dashboard/summary`

Response:

```json
{
  "productsCount": 8,
  "originsCount": 7,
  "ordersCount": 4,
  "pendingOrdersCount": 2,
  "messagesCount": 12,
  "unreadMessagesCount": 3,
  "paymentsCount": 4,
  "paidAmount": 1745.0,
  "currency": "EGP"
}
```

### `GET /api/admin/dashboard/recent-activity`

Response:

```json
[
  {
    "type": "content_publish",
    "title": "Hero section published",
    "createdAtUtc": "2026-04-20T08:15:00Z"
  },
  {
    "type": "message_created",
    "title": "New contact message from Ahmed Samir",
    "createdAtUtc": "2026-04-20T07:55:00Z"
  }
]
```

---

## 6.3 Products

### `GET /api/admin/products`

Supports:

- `search`
- `status`
- `category`
- `originId`
- `page`
- `pageSize`

Response item shape:

```json
{
  "id": "1",
  "slug": "premium-apples",
  "nameEn": "Premium Apples",
  "nameAr": "تفاح فاخر",
  "descriptionEn": "Exquisite selection of crisp apples.",
  "descriptionAr": "تشكيلة رائعة من التفاح الفاخر.",
  "imageAssetId": "0c97f281-a68c-4b0e-a8d1-13cf6b7f9c17",
  "imageUrl": "/uploads/products/premium-apples.png",
  "imageFilter": "none",
  "categoryKey": "stone",
  "originIds": ["origin-italy", "origin-greece"],
  "varieties": [{ "id": "var-1", "nameEn": "Gala", "nameAr": "جالا", "sortOrder": 1 }],
  "isFeatured": true,
  "isPublished": true,
  "sortOrder": 1
}
```

### `GET /api/admin/products/{id}`

### `POST /api/admin/products`

### `PUT /api/admin/products/{id}`

Request body for create/update:

```json
{
  "slug": "premium-apples",
  "nameEn": "Premium Apples",
  "nameAr": "تفاح فاخر",
  "descriptionEn": "Exquisite selection of crisp apples.",
  "descriptionAr": "تشكيلة رائعة من التفاح الفاخر.",
  "imageAssetId": "0c97f281-a68c-4b0e-a8d1-13cf6b7f9c17",
  "imageUrl": "/uploads/products/premium-apples.png",
  "imageFilter": "none",
  "categoryKey": "stone",
  "originIds": ["origin-italy", "origin-greece"],
  "varieties": [
    { "nameEn": "Gala", "nameAr": "جالا", "sortOrder": 1 },
    { "nameEn": "Golden", "nameAr": "جولدن", "sortOrder": 2 }
  ],
  "isFeatured": true,
  "isPublished": true,
  "sortOrder": 1
}
```

### `DELETE /api/admin/products/{id}`

---

## 6.4 Origins

### `GET /api/admin/origins`

### `GET /api/admin/origins/{id}`

### `POST /api/admin/origins`

### `PUT /api/admin/origins/{id}`

### `DELETE /api/admin/origins/{id}`

Request body:

```json
{
  "slug": "italy",
  "countryEn": "Italy",
  "countryAr": "إيطاليا",
  "flagEmoji": "🇮🇹",
  "sortOrder": 1,
  "isPublished": true
}
```

---

## 6.5 Media

### `POST /api/admin/media`

`multipart/form-data`

Fields:

- `file`
- `folder`
- `altText`

Response:

```json
{
  "id": "0c97f281-a68c-4b0e-a8d1-13cf6b7f9c17",
  "url": "/uploads/site-content/hero-bg.webp",
  "fileName": "hero-bg.webp",
  "contentType": "image/webp",
  "sizeInBytes": 452120,
  "width": 1920,
  "height": 1080,
  "altText": "Hero background"
}
```

---

## 6.6 Site Content

هذا الجزء مسؤول عن الـ structured editing وليس التعديل الحر.

### `GET /api/admin/site-content/pages`

Response:

```json
[
  {
    "pageKey": "home",
    "name": "Home",
    "route": "/",
    "sections": [
      { "sectionKey": "navbar", "displayName": "Navbar", "sortOrder": 1, "isVisible": true },
      { "sectionKey": "hero", "displayName": "Hero", "sortOrder": 2, "isVisible": true },
      { "sectionKey": "slice", "displayName": "Fruit Slice", "sortOrder": 3, "isVisible": true },
      { "sectionKey": "marquee", "displayName": "Marquee", "sortOrder": 4, "isVisible": true },
      { "sectionKey": "about", "displayName": "About", "sortOrder": 5, "isVisible": true },
      {
        "sectionKey": "products",
        "displayName": "Products Header",
        "sortOrder": 6,
        "isVisible": true
      },
      {
        "sectionKey": "origins",
        "displayName": "Origins Header",
        "sortOrder": 7,
        "isVisible": true
      },
      { "sectionKey": "whyUs", "displayName": "Why Us", "sortOrder": 8, "isVisible": true },
      { "sectionKey": "footer", "displayName": "Footer", "sortOrder": 9, "isVisible": true }
    ]
  }
]
```

### `GET /api/admin/site-content/pages/{pageKey}/sections/{sectionKey}?locale=ar&status=draft`

Response:

```json
{
  "pageKey": "home",
  "sectionKey": "hero",
  "locale": "ar",
  "status": "draft",
  "versionNumber": 5,
  "content": {
    "eyebrow": "مستوردو كبار الفواكه الفاخرة",
    "title": "المصطفى",
    "subtitle": "المستورد الرائد للفواكه الفاخرة في القاهرة.",
    "cta": "استكشف منتجاتنا"
  }
}
```

### `PUT /api/admin/site-content/pages/{pageKey}/sections/{sectionKey}`

Request:

```json
{
  "locale": "ar",
  "status": "draft",
  "content": {
    "title": "المصطفى",
    "subtitle": "وصف جديد",
    "cta": "اعرف أكثر"
  }
}
```

### `POST /api/admin/site-content/publish`

Request:

```json
{
  "pageKey": "home",
  "sectionKeys": ["hero", "footer"],
  "publishAllDrafts": false
}
```

### `POST /api/admin/site-content/reorder-sections`

### `PATCH /api/admin/site-content/sections/{sectionKey}/visibility`

---

## 6.7 Visual Editor

الـ visual editor يجب أن يشتغل فوق نفس data source المستخدمة في `Site Content`, `Products`, `Origins` وليس storage منفصل.

### `GET /api/admin/visual-editor/page/{pageKey}?locale=ar&status=draft`

Response:

```json
{
  "pageKey": "home",
  "locale": "ar",
  "status": "draft",
  "publicRoute": "/",
  "versionStamp": "home-ar-draft-v12",
  "sections": [
    {
      "sectionKey": "hero",
      "editableNodes": [
        {
          "nodeId": "hero.title",
          "label": "Hero Title",
          "type": "text",
          "scope": "localized",
          "sectionKey": "hero",
          "value": "المصطفى",
          "styles": null,
          "binding": {
            "sourceType": "cms_section_field",
            "sourceRef": "home.hero",
            "fieldPath": "title"
          }
        },
        {
          "nodeId": "slice.image.top",
          "label": "Slice Top Image",
          "type": "image",
          "scope": "global",
          "sectionKey": "slice",
          "value": "/assets/real-orange.png",
          "styles": null,
          "binding": {
            "sourceType": "cms_section_field",
            "sourceRef": "home.slice",
            "fieldPath": "imageTopUrl"
          }
        },
        {
          "nodeId": "product.1.title",
          "label": "Premium Apples Title",
          "type": "text",
          "scope": "localized",
          "sectionKey": "products",
          "value": "تفاح فاخر",
          "styles": null,
          "binding": {
            "sourceType": "product_field",
            "sourceRef": "products/1",
            "fieldPath": "nameAr"
          }
        }
      ]
    }
  ]
}
```

### `PATCH /api/admin/visual-editor/nodes/{nodeId}`

Request:

```json
{
  "pageKey": "home",
  "locale": "ar",
  "status": "draft",
  "value": "محتوى جديد"
}
```

السلوك:

- لو الـ node مربوط بـ CMS section يتم تعديل draft version لتلك section.
- لو الـ node مربوط بـ product/origin يتم تعديل draft data في جدول الكيان نفسه أو draft shadow table.
- لو الـ node مربوط بـ image asset يتم تحديث asset reference فقط.

### `PATCH /api/admin/visual-editor/styles/{nodeId}`

Request:

```json
{
  "pageKey": "home",
  "locale": "ar",
  "status": "draft",
  "styles": {
    "color": "#ffffff",
    "fontSize": "72px",
    "textAlign": "center"
  }
}
```

### `POST /api/admin/visual-editor/save-layout`

### `POST /api/admin/visual-editor/publish`

Request:

```json
{
  "pageKey": "home",
  "locale": "ar"
}
```

---

## 6.8 Messages

### `GET /api/admin/messages?status=new&page=1&pageSize=20`

### `GET /api/admin/messages/{id}`

### `PATCH /api/admin/messages/{id}/status`

```json
{
  "status": "read"
}
```

### `DELETE /api/admin/messages/{id}`

اختياري.

---

## 6.9 Orders

### `GET /api/admin/orders`

### `GET /api/admin/orders/{id}`

### `PATCH /api/admin/orders/{id}/status`

```json
{
  "status": "confirmed"
}
```

---

## 6.10 Payments

### `GET /api/admin/payments`

### `GET /api/admin/payments/{id}`

### `PATCH /api/admin/payments/{id}/status`

```json
{
  "status": "paid"
}
```

---

## 6.11 Public APIs

الـ public site يجب أن يقرأ فقط من `published` data.

### `GET /api/public/site-content/{pageKey}?locale=ar`

Response:

```json
{
  "pageKey": "home",
  "locale": "ar",
  "sections": [
    {
      "sectionKey": "hero",
      "sortOrder": 2,
      "isVisible": true,
      "content": {
        "eyebrow": "مستوردو كبار الفواكه الفاخرة",
        "title": "المصطفى",
        "subtitle": "المستورد الرائد للفواكه الفاخرة في القاهرة.",
        "cta": "استكشف منتجاتنا"
      }
    }
  ]
}
```

### `GET /api/public/products?locale=ar`

### `GET /api/public/origins?locale=ar`

### `POST /api/public/contact-messages`

```json
{
  "fullName": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "phone": "+201001234567",
  "subject": "Business Inquiry",
  "message": "I want to contact your sales team."
}
```

---

## 7. قواعد التصميم

1. كل admin endpoints يجب أن تكون protected.
2. verification codes لا تخزن plain text.
3. refresh tokens لا تخزن plain text.
4. `draft` و `published` يجب أن يكونا واضحين في الـ schema.
5. الـ visual editor لا يجب أن ينشئ source of truth جديد منفصل عن CMS.
6. النصوص العربية والإنجليزية يجب أن تحفظ `nvarchar` / UTF-8.
7. media URLs يجب أن تكون ثابتة وصالحة للفرونت.
8. أي dynamic node ID يجب أن يعتمد على stable key وليس label ظاهر للمستخدم.

---

## 8. التوصية التقنية

الستاك المقترح:

- `ASP.NET Core Web API`
- `EF Core`
- `SQL Server`
- `JWT access token`
- `Refresh token`
- `SMTP / email provider`
- `Local disk` أو `S3 / Blob Storage` للصور

---

## 9. خطة الربط مع الفرونت الحالي

### Phase 1

- auth
- dashboard summary
- products CRUD
- origins CRUD
- media upload

### Phase 2

- site-content endpoints
- public site-content endpoint
- استبدال `LanguageService` و `MockSiteContentService`

### Phase 3

- visual-editor node bindings
- live preview draft flow
- publish flow

### Phase 4

- messages
- orders
- payments

---

## 10. المطلوب من الداتابيز

الهيكل المقترح للداتابيز موجود في الملف التالي:

- `docs/admin-database-structure.md`

هذا الملف هو المرجع الأساسي للجداول، العلاقات، والـ mapping بين الجداول والـ endpoints.
