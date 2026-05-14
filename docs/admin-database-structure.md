# Admin Database Structure

## 1. الهدف

هذا الملف يحدد database schema مناسبة للـ admin backend الحالي، ومتوافقة مع:

- admin auth endpoints
- dashboard summary endpoints
- products / origins CRUD
- site content endpoints
- visual editor endpoints
- media upload
- messages / orders / payments
- public read endpoints

---

## 2. مبادئ التصميم

1. لا يوجد أكثر من source of truth لنفس البيانات.
2. البيانات structured تبقى relational قدر الإمكان.
3. بيانات الـ CMS sections يمكن تخزينها JSON لأن shape كل section مختلف.
4. الـ visual editor يحتاج layer تربط `nodeId` بالمصدر الحقيقي للبيانات.
5. الـ draft و `published` يجب أن يكونا واضحين داخل schema.
6. أي editable key ديناميكي يجب أن يعتمد على stable IDs وليس أسماء معروضة.

---

## 3. الجداول الأساسية

## 3.1 `admin_users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `email` | `nvarchar(256)` | unique |
| `full_name` | `nvarchar(150)` | |
| `role` | `nvarchar(50)` | `SuperAdmin`, `Editor` |
| `is_active` | `bit` | |
| `last_login_at_utc` | `datetime2` | nullable |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

## 3.2 `admin_verification_codes`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `admin_user_id` | `uniqueidentifier` | FK -> `admin_users.id` |
| `code_hash` | `nvarchar(500)` | never store raw code |
| `expires_at_utc` | `datetime2` | |
| `consumed_at_utc` | `datetime2` | nullable |
| `attempts_count` | `int` | |
| `ip_address` | `nvarchar(100)` | nullable |
| `created_at_utc` | `datetime2` | |

## 3.3 `admin_refresh_tokens`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `admin_user_id` | `uniqueidentifier` | FK -> `admin_users.id` |
| `token_hash` | `nvarchar(500)` | |
| `expires_at_utc` | `datetime2` | |
| `revoked_at_utc` | `datetime2` | nullable |
| `created_at_utc` | `datetime2` | |

## 3.4 `admin_activity_logs`

هذا الجدول يغذي `GET /api/admin/dashboard/recent-activity`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `admin_user_id` | `uniqueidentifier` | FK nullable |
| `activity_type` | `nvarchar(50)` | `content_publish`, `product_created`, `message_created` |
| `entity_type` | `nvarchar(50)` | nullable |
| `entity_id` | `nvarchar(100)` | nullable |
| `title` | `nvarchar(250)` | |
| `meta_json` | `nvarchar(max)` | nullable |
| `created_at_utc` | `datetime2` | |

---

## 4. Media

## 4.1 `media_assets`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `file_name` | `nvarchar(255)` | |
| `original_file_name` | `nvarchar(255)` | |
| `content_type` | `nvarchar(100)` | |
| `size_in_bytes` | `bigint` | |
| `url` | `nvarchar(1000)` | |
| `storage_provider` | `nvarchar(50)` | `local`, `s3`, `blob` |
| `folder` | `nvarchar(150)` | nullable |
| `width` | `int` | nullable |
| `height` | `int` | nullable |
| `alt_text` | `nvarchar(300)` | nullable |
| `uploaded_by_admin_id` | `uniqueidentifier` | FK -> `admin_users.id` |
| `created_at_utc` | `datetime2` | |

---

## 5. Catalog

## 5.1 `origins`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `slug` | `nvarchar(100)` | unique, stable key for editor nodes |
| `country_en` | `nvarchar(150)` | |
| `country_ar` | `nvarchar(150)` | |
| `flag_emoji` | `nvarchar(20)` | |
| `sort_order` | `int` | |
| `is_published` | `bit` | |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

## 5.2 `products`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `slug` | `nvarchar(150)` | unique |
| `name_en` | `nvarchar(200)` | |
| `name_ar` | `nvarchar(200)` | |
| `description_en` | `nvarchar(max)` | |
| `description_ar` | `nvarchar(max)` | |
| `image_asset_id` | `uniqueidentifier` | FK -> `media_assets.id`, nullable |
| `image_url` | `nvarchar(1000)` | fallback |
| `image_filter` | `nvarchar(100)` | nullable |
| `category_key` | `nvarchar(100)` | |
| `is_featured` | `bit` | |
| `is_published` | `bit` | |
| `sort_order` | `int` | |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

## 5.3 `product_origins`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `product_id` | `uniqueidentifier` | FK -> `products.id` |
| `origin_id` | `uniqueidentifier` | FK -> `origins.id` |

Unique index:

- `(product_id, origin_id)`

## 5.4 `product_varieties`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `product_id` | `uniqueidentifier` | FK -> `products.id` |
| `name_en` | `nvarchar(150)` | |
| `name_ar` | `nvarchar(150)` | |
| `sort_order` | `int` | |

---

## 6. CMS

## 6.1 `cms_pages`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `page_key` | `nvarchar(100)` | unique, ex: `home` |
| `name` | `nvarchar(150)` | |
| `route` | `nvarchar(200)` | ex: `/` |
| `is_active` | `bit` | |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

## 6.2 `cms_sections`

كل section مستقلة داخل الصفحة.

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `page_id` | `uniqueidentifier` | FK -> `cms_pages.id` |
| `section_key` | `nvarchar(100)` | unique per page |
| `display_name` | `nvarchar(150)` | |
| `sort_order` | `int` | |
| `is_visible` | `bit` | |
| `section_type` | `nvarchar(50)` | `content`, `collection`, `layout` |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

Suggested initial rows for `home`:

- `navbar`
- `hero`
- `slice`
- `marquee`
- `about`
- `products`
- `origins`
- `whyUs`
- `footer`

## 6.3 `cms_section_versions`

هذا هو المصدر الأساسي للمحتوى الـ structured.

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `section_id` | `uniqueidentifier` | FK -> `cms_sections.id` |
| `locale` | `nvarchar(10)` | `en`, `ar` |
| `status` | `nvarchar(20)` | `draft`, `published`, `archived` |
| `version_number` | `int` | |
| `content_json` | `nvarchar(max)` | actual section payload |
| `created_by_admin_id` | `uniqueidentifier` | FK -> `admin_users.id` |
| `published_by_admin_id` | `uniqueidentifier` | FK nullable |
| `created_at_utc` | `datetime2` | |
| `published_at_utc` | `datetime2` | nullable |

Unique constraints:

- `(section_id, locale, status, version_number)`

Recommended lookup indexes:

- `(section_id, locale, status)`

## 6.4 `cms_node_bindings`

هذا الجدول مهم جدا للـ visual editor.

بدونه سيتحول الـ backend إلى switch/case ضخم على `nodeId`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `page_id` | `uniqueidentifier` | FK -> `cms_pages.id` |
| `section_id` | `uniqueidentifier` | FK -> `cms_sections.id`, nullable |
| `node_id` | `nvarchar(200)` | unique |
| `label` | `nvarchar(200)` | |
| `node_type` | `nvarchar(50)` | `text`, `textarea`, `html`, `image`, `style` |
| `scope` | `nvarchar(20)` | `localized`, `global` |
| `source_type` | `nvarchar(50)` | `cms_section_field`, `product_field`, `origin_field`, `asset_field` |
| `source_ref` | `nvarchar(200)` | ex: `home.hero`, `products/{id}` |
| `field_path` | `nvarchar(200)` | ex: `title`, `descriptionAr`, `imageUrl` |
| `is_active` | `bit` | |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

Examples:

| node_id | source_type | source_ref | field_path |
|---|---|---|---|
| `hero.title` | `cms_section_field` | `home.hero` | `title` |
| `slice.image.top` | `cms_section_field` | `home.slice` | `imageTopUrl` |
| `product.{productId}.title` | `product_field` | `products/{productId}` | `name` |
| `origin.{originSlug}.title` | `origin_field` | `origins/{originId}` | `country` |

## 6.5 `cms_node_style_overrides`

هذا الجدول يخدم `PATCH /api/admin/visual-editor/styles/{nodeId}`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `node_binding_id` | `uniqueidentifier` | FK -> `cms_node_bindings.id` |
| `locale` | `nvarchar(10)` | nullable for global nodes |
| `status` | `nvarchar(20)` | `draft`, `published` |
| `styles_json` | `nvarchar(max)` | color, fontSize, alignment, etc |
| `created_by_admin_id` | `uniqueidentifier` | FK |
| `created_at_utc` | `datetime2` | |
| `published_at_utc` | `datetime2` | nullable |

Unique recommended index:

- `(node_binding_id, locale, status)`

---

## 7. Public communication / CRM

## 7.1 `contact_messages`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `full_name` | `nvarchar(150)` | |
| `email` | `nvarchar(256)` | |
| `phone` | `nvarchar(50)` | nullable |
| `subject` | `nvarchar(200)` | nullable |
| `message` | `nvarchar(max)` | |
| `status` | `nvarchar(20)` | `new`, `read`, `archived`, `replied` |
| `created_at_utc` | `datetime2` | |
| `read_at_utc` | `datetime2` | nullable |

---

## 8. Orders / Payments

## 8.1 `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `order_number` | `nvarchar(50)` | unique |
| `customer_name` | `nvarchar(150)` | |
| `customer_email` | `nvarchar(256)` | |
| `customer_phone` | `nvarchar(50)` | |
| `total_amount` | `decimal(18,2)` | |
| `currency` | `nvarchar(10)` | ex: `EGP` |
| `status` | `nvarchar(20)` | `pending`, `confirmed`, `completed`, `cancelled` |
| `payment_method` | `nvarchar(50)` | |
| `payment_status` | `nvarchar(20)` | `pending`, `paid`, `failed`, `refunded` |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

## 8.2 `order_items`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `order_id` | `uniqueidentifier` | FK -> `orders.id` |
| `product_id` | `uniqueidentifier` | FK -> `products.id`, nullable |
| `product_name_snapshot` | `nvarchar(200)` | |
| `quantity` | `int` | |
| `unit_price` | `decimal(18,2)` | |
| `line_total` | `decimal(18,2)` | |

## 8.3 `payments`

| Column | Type | Notes |
|---|---|---|
| `id` | `uniqueidentifier` | PK |
| `order_id` | `uniqueidentifier` | FK -> `orders.id` |
| `provider` | `nvarchar(50)` | `paymob`, `cod`, etc |
| `transaction_reference` | `nvarchar(200)` | nullable |
| `amount` | `decimal(18,2)` | |
| `currency` | `nvarchar(10)` | |
| `status` | `nvarchar(20)` | `pending`, `paid`, `failed`, `refunded` |
| `raw_response_json` | `nvarchar(max)` | nullable |
| `created_at_utc` | `datetime2` | |
| `updated_at_utc` | `datetime2` | |

---

## 9. Mapping الجداول إلى الـ endpoints

| Endpoint Group | Main Tables |
|---|---|
| `POST /api/admin/auth/request-code` | `admin_users`, `admin_verification_codes` |
| `POST /api/admin/auth/verify-code` | `admin_users`, `admin_verification_codes`, `admin_refresh_tokens` |
| `GET /api/admin/dashboard/summary` | `products`, `origins`, `orders`, `payments`, `contact_messages` |
| `GET /api/admin/dashboard/recent-activity` | `admin_activity_logs` |
| `GET/POST/PUT/DELETE /api/admin/products` | `products`, `product_origins`, `product_varieties`, `media_assets` |
| `GET/POST/PUT/DELETE /api/admin/origins` | `origins` |
| `GET/PUT /api/admin/site-content/...` | `cms_pages`, `cms_sections`, `cms_section_versions` |
| `POST /api/admin/site-content/publish` | `cms_section_versions`, `admin_activity_logs` |
| `GET /api/admin/visual-editor/page/...` | `cms_pages`, `cms_sections`, `cms_section_versions`, `cms_node_bindings`, `cms_node_style_overrides`, `products`, `origins` |
| `PATCH /api/admin/visual-editor/nodes/{nodeId}` | `cms_node_bindings` + target source table |
| `PATCH /api/admin/visual-editor/styles/{nodeId}` | `cms_node_style_overrides` |
| `POST /api/admin/media` | `media_assets` |
| `GET/PATCH /api/admin/messages` | `contact_messages` |
| `GET/PATCH /api/admin/orders` | `orders`, `order_items` |
| `GET/PATCH /api/admin/payments` | `payments` |
| `GET /api/public/site-content/{pageKey}` | `cms_sections`, `cms_section_versions` with `status = published` |
| `GET /api/public/products` | `products`, `product_origins`, `product_varieties`, `origins` |
| `GET /api/public/origins` | `origins`, `product_origins`, `products` |
| `POST /api/public/contact-messages` | `contact_messages`, `admin_activity_logs` |

---

## 10. شكل `content_json` المقترح لكل section

## 10.1 `navbar`

```json
{
  "logoUrl": "/assets/logo.png",
  "about": "About",
  "products": "Products",
  "origins": "Origins",
  "contact": "Contact"
}
```

## 10.2 `hero`

```json
{
  "eyebrow": "PREMIUM FRUIT IMPORTERS",
  "title": "EL MOSTAFA",
  "subtitle": "Cairo's leading importer of premium tropical and exotic fruits.",
  "cta": "EXPLORE PRODUCTS",
  "floatingFruits": [
    { "assetId": "fruit-1", "imageUrl": "/assets/real-orange.png", "sortOrder": 1 },
    { "assetId": "fruit-2", "imageUrl": "/assets/real-kiwi.png", "sortOrder": 2 }
  ]
}
```

## 10.3 `slice`

```json
{
  "title": "The Core of<br />Excellence",
  "subtitle": "Unveiling nature's finest selections.",
  "imageTopUrl": "/assets/real-orange.png",
  "imageBottomUrl": "/assets/real-orange.png"
}
```

## 10.4 `marquee`

```json
{
  "items": [
    "PREMIUM QUALITY",
    "IMPORTED DAILY",
    "100% FRESH"
  ]
}
```

## 10.5 `about`

```json
{
  "eyebrow": "OUR STORY",
  "title": "The Journey",
  "subtitle": "Scroll to trace the path of perfection.",
  "trackerOrangeUrl": "/assets/real-orange.png",
  "trackerKiwiUrl": "/assets/real-kiwi.png",
  "trackerAppleUrl": "/assets/real-apple.png",
  "nodes": [
    { "title": "The Origin", "desc": "..." },
    { "title": "The Selection", "desc": "..." },
    { "title": "The Delivery", "desc": "..." }
  ]
}
```

## 10.6 `products`

```json
{
  "eyebrow": "EL MOSTAFA COLLECTION",
  "title": "Our Harvest",
  "subtitle": "Explore our highly curated selection."
}
```

## 10.7 `origins`

```json
{
  "eyebrow": "OUR NETWORK",
  "title": "Global Origins",
  "subtitle": "We source only from the world's most renowned agricultural regions."
}
```

## 10.8 `whyUs`

```json
{
  "eyebrow": "OUR COMMITMENT",
  "title": "Why El Mostafa",
  "subtitle": "Excellence in every bite.",
  "pillars": [
    { "title": "Global Network", "desc": "..." },
    { "title": "Temperature Controlled", "desc": "..." },
    { "title": "Unmatched Quality", "desc": "..." }
  ]
}
```

## 10.9 `footer`

```json
{
  "brandText": {
    "en": "EL MOSTAFA",
    "ar": "المصطفى"
  },
  "description": "Premium quality fruit importers serving Cairo.",
  "address": "Cairo, Egypt",
  "email": "contact@elmostafafruits.com",
  "phone": "+20 100 000 0000"
}
```

---

## 11. Seed / Migration Plan من المشروع الحالي

1. انقل `public/assets/data.json` إلى:
   - `products`
   - `origins`
   - `product_origins`
   - `product_varieties`
2. انقل النصوص الحالية من:
   - `LanguageService`
   - `MockSiteContentService`
   إلى `cms_section_versions`
3. أنشئ seed rows في `cms_sections` للـ home page.
4. أنشئ seed rows في `cms_node_bindings` بناء على الـ `data-edit-id` الحالية.
5. بدّل dynamic origin node keys من أسماء الدول إلى `origin.slug` أو `origin.id`.

---

## 12. القرار الموصى به

أفضل structure لهذا المشروع هي:

- Relational tables للـ auth, products, origins, messages, orders, payments, media
- JSON versioning للـ CMS sections
- Node binding table للـ visual editor
- Style override table منفصلة للـ visual editor

هذا يحقق 3 أهداف:

1. backend نظيف وقابل للصيانة
2. visual editor generic وليس hardcoded
3. public site و admin dashboard يقرآن من نفس source of truth
