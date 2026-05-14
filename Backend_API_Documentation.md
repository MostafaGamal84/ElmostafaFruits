# EL-MOSTAFA Portfolio - Backend API Documentation
This document outlines the exact REST API endpoints the Frontend requires to replace the existing Mock Services with a real Backend.

## 📌 1. Authentication (`/api/v1/auth`)
Uses a passwordless login flow with email verification codes.

### 1.1 Request Verification Code
- **Endpoint:** `POST /api/v1/auth/request-code`
- **Description:** Sends a verification code to the admin's email.
- **Payload:**
```json
{
  "email": "admin@example.com"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### 1.2 Verify Code
- **Endpoint:** `POST /api/v1/auth/verify-code`
- **Description:** Verifies the code and returns an auth token.
- **Payload:**
```json
{
  "email": "admin@example.com",
  "code": "123456"
}
```
- **Response:** `200 OK`
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "email": "admin@example.com",
    "fullName": "Admin User"
  }
}
```

---

## 📌 2. Products / Showcase (`/api/v1/products`)
Used to manage the product cards displayed in the public grid.

### 2.1 Get All Products
- **Endpoint:** `GET /api/v1/products`
- **Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "Premium Apples",
    "name_ar": "تفاح فاخر",
    "category": "stone",
    "origin": ["Italy"],
    "imageUrl": "assets/real-apple.png",
    "status": "Live",
    "updatedAt": "2026-04-20T00:00:00Z",
    "note": "Featured in the public showcase grid.",
    "description": "Premium sweet apples",
    "description_ar": "تفاح سكري فاخر"
  }
]
```

### 2.2 Create Product (Admin Only)
- **Endpoint:** `POST /api/v1/products`
- **Payload:** Includes the fields above without `id` and `updatedAt`.
- **Response:** `201 Created`

### 2.3 Update Product (Admin Only)
- **Endpoint:** `PUT /api/v1/products/:id`
- **Payload:** Partial product fields.
- **Response:** `200 OK`

---

## 📌 3. Origins Network (`/api/v1/origins`)
Used to manage the sourcing map and country flags.

### 3.1 Get All Origins
- **Endpoint:** `GET /api/v1/origins`
- **Response:** `200 OK`
```json
[
  {
    "id": "IT",
    "flag": "IT",
    "country": "Italy",
    "country_ar": "إيطاليا",
    "focus": "Apples, plums, peaches, and cherries",
    "featuredItems": 5,
    "status": "Active"
  }
]
```

### 3.2 Update Origin (Admin Only)
- **Endpoint:** `PUT /api/v1/origins/:id`
- **Payload:** Partial fields.
- **Response:** `200 OK`

---

## 📌 4. Public Messages (`/api/v1/messages`)
Inbox functionality for public visitors contacting the platform.

### 4.1 Submit New Message (Public)
- **Endpoint:** `POST /api/v1/messages`
- **Payload:**
```json
{
  "name": "Karim Saleh",
  "email": "karim@example.com",
  "subject": "Portfolio collaboration request",
  "message": "Full message content here..."
}
```
- **Response:** `201 Created`

### 4.2 Get Messages (Admin Only)
- **Endpoint:** `GET /api/v1/messages`
- **Response:** `200 OK`
```json
[
  {
    "id": "MSG-001",
    "name": "Karim Saleh",
    "email": "karim@example.com",
    "subject": "Portfolio collaboration request",
    "summary": "Full message truncated here...",
    "status": "New", 
    "createdAt": "2026-04-20T10:00:00Z"
  }
]
```

---

## 📌 5. Site Content / Copy Studio (`/api/v1/content`)
Manages structured sections content (localization overrides).

### 5.1 Get Site Content (Public)
- **Endpoint:** `GET /api/v1/content`
- **Description:** Returns the global JSON document representing the site configuration.
- **Response:** `200 OK`
```json
{
  "navbar": {
    "about": { "en": "About", "ar": "عنا" }
  },
  "hero": {
    "title": { "en": "EL MOSTAFA", "ar": "المصطفى" }
  },
  "footer": {
    "brandText": {
      "en": "EL MOSTAFA",
      "ar": "\u0627\u0644\u0645\u0635\u0637\u0641\u0649"
    },
    "email": "contact@elmostafafruits.com"
  }
}
```

### 5.2 Update Site Content (Admin Only)
- **Endpoint:** `PUT /api/v1/content`
- **Payload:** Full JSON object matching the above structure.
- **Response:** `200 OK`

---

## 📌 6. Visual Editor Overrides (`/api/v1/overrides`)
Stores atomic live visual overrides mapped by the component DOM nodes (`data-edit-id`).

### 6.1 Get Overrides (Public)
- **Endpoint:** `GET /api/v1/overrides`
- **Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nodeId": "hero.title",
    "type": "text", 
    "scope": "en", 
    "value": "EL MOSTAFA PREMIUM"
  }
]
```

### 6.2 Save/Update Override (Admin Only)
- **Endpoint:** `POST /api/v1/overrides`
- **Payload:**
```json
{
  "nodeId": "hero.title",
  "type": "text", 
  "scope": "en", 
  "value": "EL MOSTAFA PREMIUM"
}
```
- **Response:** `200 OK`
