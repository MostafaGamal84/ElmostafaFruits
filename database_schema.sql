-- EL-MOSTAFA Portfolio - Database Schema (PostgreSQL)

CREATE TYPE product_category AS ENUM ('tropical', 'stone', 'citrus', 'exotic');
CREATE TYPE content_status AS ENUM ('Draft', 'Live', 'Active', 'Seasonal', 'Review');
CREATE TYPE message_status AS ENUM ('New', 'Read');
CREATE TYPE value_type AS ENUM ('text', 'textarea', 'html', 'image');

-- 1. Admin Users Table (For Auth)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products / Showcase Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    category product_category NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_filter VARCHAR(100),
    origin text[] DEFAULT '{}',
    varieties text[] DEFAULT '{}',
    description TEXT NOT NULL,
    description_ar TEXT,
    note TEXT,
    status content_status DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Origins Network Table
CREATE TABLE origins (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'IT', 'GR', 'KE'
    flag VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_ar VARCHAR(100),
    focus TEXT,
    featured_items INTEGER DEFAULT 0,
    status content_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Messages (Contact Form Inbox)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    summary TEXT, -- Admin generated summary snippet 
    status message_status DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Global Site Content Table 
-- Using JSONB since the MockSiteContent structure is nested and hierarchical
CREATE TABLE site_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    configuration JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure only one row exists for global configuration
    CONSTRAINT site_content_single_row CHECK (id = 1) 
);

-- 6. Visual Editor Overrides Table
CREATE TABLE visual_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(255) NOT NULL, 
    type value_type NOT NULL DEFAULT 'text',
    scope VARCHAR(10) NOT NULL, -- 'en', 'ar', or 'global'
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Unique constraint so an element only has one override per scope
    UNIQUE(node_id, scope)
);

-- Indexes for performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_visual_overrides_scope ON visual_overrides(scope);

-- Seed Data for Global Content
INSERT INTO site_content (configuration) VALUES (
'{
  "navbar": {
    "about": { "en": "About", "ar": "عنا" },
    "products": { "en": "Products", "ar": "منتجاتنا" },
    "origins": { "en": "Origins", "ar": "المصادر" },
    "contact": { "en": "Contact", "ar": "تواصل معنا" }
  },
  "hero": {
    "eyebrow": { "en": "PREMIUM FRUIT IMPORTERS", "ar": "مستوردو كبار الفواكه الفاخرة" },
    "title": { "en": "EL MOSTAFA", "ar": "المصطفى" },
    "subtitle": {
      "en": "Cairo''s leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
      "ar": "المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالمياً، ومسلمة طازجة."
    },
    "cta": { "en": "EXPLORE PRODUCTS", "ar": "استكشف منتجاتنا" }
  },
  "footer": {
    "brandText": {
      "en": "EL MOSTAFA",
      "ar": "\u0627\u0644\u0645\u0635\u0637\u0641\u0649"
    },
    "description": {
      "en": "Premium quality fruit importers serving Cairo with the finest selection from around the globe since 2010.",
      "ar": "مستوردو فواكه بجودة عالية نخدم القاهرة بأفضل الاختيارات من جميع أنحاء العالم منذ عام 2010."
    },
    "address": {
      "en": "Cairo, Egypt",
      "ar": "القاهرة، مصر"
    },
    "email": "contact@elmostafafruits.com",
    "phone": "+20 100 000 0000"
  }
}'::jsonb);

-- Initial Admin Account Seed
INSERT INTO admin_users (email, full_name, role) VALUES ('admin@example.com', 'Admin System', 'admin');
