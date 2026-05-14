# Backend Requirements - EL MOSTAFA Portfolio

## 1. API Base URL

```
https://elmostafaportfolio.somee.com/api/v1
```

---

## 2. Endpoints

### 2.1 Auth `/api/v1/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request-code` | Send verification code to email |
| POST | `/verify-code` | Verify code and return token |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Revoke refresh token |
| GET | `/users` | Get admin users (admin only) |

### 2.2 Products `/api/v1/products`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products |
| POST | `/` | Create new product |
| PUT | `/{id}` | Update product |
| DELETE | `/{id}` | Delete product |

### 2.3 Origins `/api/v1/origins`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all origins |
| PUT | `/{id}` | Update origin |

### 2.4 Site Content `/api/v1/content`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get site content |
| PUT | `/` | Update site content |

### 2.5 Visual Overrides `/api/v1/overrides`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all overrides |
| POST | `/` | Save/update override |

### 2.6 Messages `/api/v1/messages`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit contact message (public) |
| GET | `/` | Get all messages (admin) |
| PATCH | `/{id}` | Update message status |

---

## 3. DTOs

### 3.1 Auth DTOs

```csharp
// POST /auth/request-code
public class RequestCodeRequest
{
    public string Email { get; set; }
}

public class RequestCodeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
}

// POST /auth/verify-code
public class VerifyCodeRequest
{
    public string Email { get; set; }
    public string Code { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public AdminUserResponse User { get; set; }
}

public class AdminUserResponse
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Role { get; set; }
}

// POST /auth/refresh
public class RefreshTokenRequest
{
    public string RefreshToken { get; set; }
}

// POST /auth/logout
public class LogoutRequest
{
    public string RefreshToken { get; set; }
}
```

### 3.2 Products DTOs

```csharp
// GET /products - Response
public class ProductResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string NameAr { get; set; }
    public string Category { get; set; }
    public List<string> Origin { get; set; }
    public string ImageUrl { get; set; }
    public string ImageFilter { get; set; }
    public string Status { get; set; }
    public string UpdatedAt { get; set; }
    public string Note { get; set; }
    public string Description { get; set; }
    public string DescriptionAr { get; set; }
}

// POST /products - Request
public class CreateProductRequest
{
    public string Name { get; set; }
    public string NameAr { get; set; }
    public string Category { get; set; }
    public List<string> Origin { get; set; }
    public string ImageUrl { get; set; }
    public string ImageFilter { get; set; }
    public string Status { get; set; }
    public string Note { get; set; }
    public string Description { get; set; }
    public string DescriptionAr { get; set; }
}

// PUT /products/{id} - Request
// Same as CreateProductRequest
```

### 3.3 Origins DTOs

```csharp
// GET /origins - Response
public class OriginResponse
{
    public string Id { get; set; }
    public string Flag { get; set; }
    public string Country { get; set; }
    public string CountryAr { get; set; }
    public string Focus { get; set; }
    public int FeaturedItems { get; set; }
    public string Status { get; set; }
}

// PUT /origins/{id} - Request
public class UpdateOriginRequest
{
    public string Flag { get; set; }
    public string Country { get; set; }
    public string CountryAr { get; set; }
    public string Focus { get; set; }
    public int FeaturedItems { get; set; }
    public string Status { get; set; }
}
```

### 3.4 Site Content DTOs

```csharp
// GET /content - Response
// PUT /content - Request
public class SiteContentResponse
{
    public NavbarContent Navbar { get; set; }
    public HeroContent Hero { get; set; }
    public FooterContent Footer { get; set; }
}

public class NavbarContent
{
    public Dictionary<string, string> About { get; set; }
    public Dictionary<string, string> Products { get; set; }
    public Dictionary<string, string> Origins { get; set; }
    public Dictionary<string, string> Contact { get; set; }
}

public class HeroContent
{
    public Dictionary<string, string> Eyebrow { get; set; }
    public Dictionary<string, string> Title { get; set; }
    public Dictionary<string, string> Subtitle { get; set; }
    public Dictionary<string, string> Cta { get; set; }
}

public class FooterContent
{
    public Dictionary<string, string> BrandText { get; set; }
    public Dictionary<string, string> Description { get; set; }
    public Dictionary<string, string> Address { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
}
```

### 3.5 Visual Overrides DTOs

```csharp
// GET /overrides - Response
// POST /overrides - Request
public class VisualOverrideResponse
{
    public string Id { get; set; }
    public string NodeId { get; set; }
    public string Type { get; set; }
    public string Scope { get; set; }
    public string Value { get; set; }
}

public class CreateOverrideRequest
{
    public string NodeId { get; set; }
    public string Type { get; set; }
    public string Scope { get; set; }
    public string Value { get; set; }
}
```

### 3.6 Messages DTOs

```csharp
// POST /messages (public)
public class ContactMessageRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Subject { get; set; }
    public string Message { get; set; }
}

public class ContactMessageResponse
{
    public string Id { get; set; }
    public bool Success { get; set; }
}

// GET /messages (admin)
public class MessageResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Subject { get; set; }
    public string Summary { get; set; }
    public string Status { get; set; }
    public string CreatedAt { get; set; }
}

// PATCH /messages/{id}
public class UpdateMessageRequest
{
    public string Status { get; set; }
}
```

---

## 4. Database Schema (SQL Server)

```sql
-- =============================================
-- EL MOSTAFA Portfolio Database Schema
-- =============================================

USE [master];
GO
IF DB_ID('ElMostafaPortfolio') IS NOT NULL
BEGIN
    ALTER DATABASE ElMostafaPortfolio SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ElMostafaPortfolio;
END
GO
CREATE DATABASE ElMostafaPortfolio;
GO
USE ElMostafaPortfolio;
GO

-- =============================================
-- 1. Admin Users
-- =============================================
CREATE TABLE [dbo].[admin_users] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [email] NVARCHAR(256) NOT NULL UNIQUE,
    [password_hash] NVARCHAR(500) NOT NULL,
    [full_name] NVARCHAR(150) NOT NULL,
    [role] NVARCHAR(50) NOT NULL DEFAULT 'Admin',
    [is_active] BIT NOT NULL DEFAULT 1,
    [last_login_at_utc] DATETIME2 NULL,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [updated_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 2. Verification Codes
-- =============================================
CREATE TABLE [dbo].[admin_verification_codes] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [admin_user_id] UNIQUEIDENTIFIER NULL,
    [code_hash] NVARCHAR(500) NOT NULL,
    [expires_at_utc] DATETIME2 NOT NULL,
    [consumed_at_utc] DATETIME2 NULL,
    [attempts_count] INT NOT NULL DEFAULT 0,
    [ip_address] NVARCHAR(100) NULL,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([admin_user_id]) REFERENCES [admin_users]([id])
);

CREATE NONCLUSTERED INDEX [IX_verification_codes_lookup]
ON [dbo].[admin_verification_codes]([admin_user_id], [expires_at_utc]);

-- =============================================
-- 3. Refresh Tokens
-- =============================================
CREATE TABLE [dbo].[admin_refresh_tokens] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [admin_user_id] UNIQUEIDENTIFIER NOT NULL,
    [token_hash] NVARCHAR(500) NOT NULL,
    [expires_at_utc] DATETIME2 NOT NULL,
    [revoked_at_utc] DATETIME2 NULL,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([admin_user_id]) REFERENCES [admin_users]([id])
);

-- =============================================
-- 4. Activity Logs
-- =============================================
CREATE TABLE [dbo].[admin_activity_logs] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [admin_user_id] UNIQUEIDENTIFIER NULL,
    [activity_type] NVARCHAR(50) NOT NULL,
    [entity_type] NVARCHAR(50) NULL,
    [entity_id] NVARCHAR(100) NULL,
    [title] NVARCHAR(250) NOT NULL,
    [meta_json] NVARCHAR(MAX) NULL,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([admin_user_id]) REFERENCES [admin_users]([id])
);

-- =============================================
-- 5. Origins
-- =============================================
CREATE TABLE [dbo].[origins] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [slug] NVARCHAR(100) NOT NULL UNIQUE,
    [country_en] NVARCHAR(150) NOT NULL,
    [country_ar] NVARCHAR(150) NOT NULL,
    [flag_emoji] NVARCHAR(20) NOT NULL,
    [focus] NVARCHAR(500) NULL,
    [sort_order] INT NOT NULL DEFAULT 0,
    [is_published] BIT NOT NULL DEFAULT 0,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [updated_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 6. Products
-- =============================================
CREATE TABLE [dbo].[products] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [slug] NVARCHAR(150) NOT NULL UNIQUE,
    [name_en] NVARCHAR(200) NOT NULL,
    [name_ar] NVARCHAR(200) NOT NULL,
    [description_en] NVARCHAR(MAX) NULL,
    [description_ar] NVARCHAR(MAX) NULL,
    [image_url] NVARCHAR(1000) NULL,
    [image_filter] NVARCHAR(100) NULL,
    [category_key] NVARCHAR(100) NOT NULL,
    [is_featured] BIT NOT NULL DEFAULT 0,
    [is_published] BIT NOT NULL DEFAULT 0,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    [note] NVARCHAR(MAX) NULL,
    [sort_order] INT NOT NULL DEFAULT 0,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [updated_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 7. Product Origins (Many-to-Many)
-- =============================================
CREATE TABLE [dbo].[product_origins] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [product_id] UNIQUEIDENTIFIER NOT NULL,
    [origin_id] UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY ([product_id]) REFERENCES [products]([id]) ON DELETE CASCADE,
    FOREIGN KEY ([origin_id]) REFERENCES [origins]([id]) ON DELETE CASCADE,
    UNIQUE ([product_id], [origin_id])
);

-- =============================================
-- 8. Site Content (JSON)
-- =============================================
CREATE TABLE [dbo].[site_content] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [content_key] NVARCHAR(100) NOT NULL UNIQUE,
    [content_json] NVARCHAR(MAX) NOT NULL,
    [updated_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 9. Visual Overrides
-- =============================================
CREATE TABLE [dbo].[visual_overrides] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [node_id] NVARCHAR(200) NOT NULL,
    [node_type] NVARCHAR(50) NOT NULL DEFAULT 'text',
    [scope] NVARCHAR(20) NOT NULL DEFAULT 'en',
    [value] NVARCHAR(MAX) NOT NULL,
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [updated_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE ([node_id], [scope])
);

-- =============================================
-- 10. Contact Messages
-- =============================================
CREATE TABLE [dbo].[contact_messages] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [full_name] NVARCHAR(150) NOT NULL,
    [email] NVARCHAR(256) NOT NULL,
    [phone] NVARCHAR(50) NULL,
    [subject] NVARCHAR(200) NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'New',
    [created_at_utc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [read_at_utc] DATETIME2 NULL
);

-- =============================================
-- 11. Indexes
-- =============================================
CREATE NONCLUSTERED INDEX [IX_products_status]
ON [dbo].[products]([status]);

CREATE NONCLUSTERED INDEX [IX_products_published]
ON [dbo].[products]([is_published], [sort_order]);

CREATE NONCLUSTERED INDEX [IX_origins_published]
ON [dbo].[origins]([is_published], [sort_order]);

CREATE NONCLUSTERED INDEX [IX_contact_messages_status]
ON [dbo].[contact_messages]([status], [created_at_utc]);

-- =============================================
-- 12. Seed Data - Admin User
-- =============================================
INSERT INTO [dbo].[admin_users] ([id], [email], [password_hash], [full_name], [role])
VALUES (
    NEWID(),
    'admin@elmostafa.com',
    '$2a$11$YourBCryptHashHere', -- Replace with actual bcrypt hash
    'El Mostafa Admin',
    'SuperAdmin'
);

-- =============================================
-- 13. Seed Data - Origins
-- =============================================
INSERT INTO [dbo].[origins] ([slug], [country_en], [country_ar], [flag_emoji], [focus], [sort_order], [is_published])
VALUES
    (N'italy', N'Italy', N'إيطاليا', N'🇮🇹', N'Apples, Plums, Peaches, Cherries', 1, 1),
    (N'greece', N'Greece', N'اليونان', N'🇬🇷', N'Oranges, Lemons, Peaches', 2, 1),
    (N'spain', N'Spain', N'إسبانيا', N'🇪🇸', N'Citrus, Stone Fruits', 3, 1),
    (N'usa', N'United States', N'الولايات المتحدة', N'🇺🇸', N'Apples, Grapes', 4, 1),
    (N'south-africa', N'South Africa', N'جنوب أفريقيا', N'🇿🇦', N'Citrus, Avocados', 5, 1),
    (N'brazil', N'Brazil', N'البرازيل', N'🇧🇷', N'Mangoes, Papayas', 6, 1),
    (N'egypt', N'Egypt', N'مصر', N'🇪🇬', N'Citrus, Mangoes', 7, 1);

-- =============================================
-- 14. Seed Data - Products
-- =============================================
INSERT INTO [dbo].[products] ([slug], [name_en], [name_ar], [description_en], [description_ar], [image_url], [category_key], [status], [is_published], [is_featured], [sort_order])
VALUES
    (N'premium-apples', N'Premium Apples', N'تفاح فاخر', N'Exquisite selection of crisp, premium apples.', N'تشكيلة رائعة من التفاح الفاخر.', N'/assets/real-apple.png', N'stone', N'Live', 1, 1, 1),
    (N'fresh-oranges', N'Fresh Oranges', N'برتقال طازج', N'Juicy, sweet oranges imported from Greece.', N'برتقال عصيري مستورد من اليونان.', N'/assets/real-orange.png', N'citrus', N'Live', 1, 1, 2),
    (N'exotic-mangoes', N'Exotic Mangoes', N'مانجو غريب', N'Premium Alphonso mangoes from India.', N'مانجو ألفونسو الهندي الفاخر.', N'/assets/real-mango.png', N'tropical', N'Live', 1, 1, 3),
    (N'premium-kiwi', N'Premium Kiwi', N'كيوي فاخر', N'Fresh Zespri kiwi from New Zealand.', N'كيوي Zealand الطازج.', N'/assets/real-kiwi.png', N' exotic', N'Live', 1, 1, 4),
    (N'sweet-peaches', N'Sweet Peaches', N'خوخ حلو', N'Juicy peaches from Mediterranean.', N'خوخ متوسطي عصيري.', N'/assets/real-peach.png', N'stone', N'Live', 1, 1, 5),
    (N'fresh-cherries', N'Fresh Cherries', N'كرز طازج', N'Premium Bing cherries.', N'كرز بينغ الفاخر.', N'/assets/real-cherry.png', N'stone', N'Live', 1, 1, 6);

-- =============================================
-- 15. Seed Data - Site Content
-- =============================================
INSERT INTO [dbo].[site_content] ([content_key], [content_json])
VALUES
    (N'navbar', N'{"about":{"en":"About","ar":"عنا"},"products":{"en":"Products","ar":"المنتجات"},"origins":{"en":"Origins","ar":"المصادر"},"contact":{"en":"Contact","ar":"اتصل بنا"}}'),
    (N'hero', N'{"eyebrow":{"en":"PREMIUM FRUIT IMPORTERS","ar":"مستوردو الفواكه الفاخرة"},"title":{"en":"EL MOSTAFA","ar":"المصطفى"},"subtitle":{"en":"Cairo''s leading importer of premium tropical and exotic fruits.","ar":"المستورد ال��ائ�� للفواكه الفاخرة في القاهرة."},"cta":{"en":"EXPLORE PRODUCTS","ar":"استكشف منتجاتنا"}}'),
    (N'footer', N'{"brandText":{"en":"EL MOSTAFA","ar":"المصطفى"},"description":{"en":"Premium quality fruit importers serving Cairo and all of Egypt.","ar":"مستوردو الفواكه الفاخرة الذي يخدم القاهرة وجميع أنحاء مصر."},"address":{"en":"Cairo, Egypt","ar":"القاهرة، مصر"},"email":"contact@elmostafafruits.com","phone":"+20 100 000 0000"}');

-- =============================================
-- Seed Data - Visual Overrides (Empty by default)
-- =============================================
-- No seed data needed - starts empty
```

---

## 5. Authentication Flow

### 5.1 Login Flow (Passwordless)

1. **Request Code**: `POST /api/v1/auth/request-code`
   ```json
   { "email": "admin@elmostafa.com" }
   ```

2. **Verify Code**: `POST /api/v1/auth/verify-code`
   ```json
   { "email": "admin@elmostafa.com", "code": "123456" }
   ```
   
   Response:
   ```json
   {
     "token": "eyJhbGc...",
     "refreshToken": "refresh-token-here",
     "user": {
       "id": "...",
       "email": "admin@elmostafa.com",
       "fullName": "El Mostafa Admin",
       "role": "SuperAdmin"
     }
   }
   ```

### 5.2 Token Refresh

```
POST /api/v1/auth/refresh
{ "refreshToken": "..." }
```

### 5.3 Protected Endpoints

All `/api/v1/*` endpoints except:
- `POST /api/v1/auth/request-code` (public)
- `POST /api/v1/messages` (public - contact form)

Require Authorization header:
```
Authorization: Bearer <token>
```

---

## 6. Response Formats

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### List Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```
