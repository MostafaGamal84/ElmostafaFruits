const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

const siteContent = {
  navbar: {
    about: { en: 'About', ar: 'عنّا' },
    products: { en: 'Products', ar: 'منتجاتنا' },
    origins: { en: 'Origins', ar: 'المصادر' },
    contact: { en: 'Contact', ar: 'تواصل معنا' },
  },
  hero: {
    eyebrow: { en: 'PREMIUM FRUIT IMPORTERS', ar: 'مستوردو كبار الفواكه الفاخرة' },
    title: { en: 'EL MOSTAFA', ar: 'المصطفى' },
    subtitle: {
      en: "Cairo's leading importer of premium tropical and exotic fruits. Sourced globally, delivered fresh.",
      ar: 'المستورد الرائد للفواكه الاستوائية والغريبة الفاخرة في القاهرة. مستوردة عالمياً، ومسلمة طازجة.',
    },
    cta: { en: 'EXPLORE PRODUCTS', ar: 'استكشف منتجاتنا' },
  },
  footer: {
    brandText: {
      en: 'EL MOSTAFA',
      ar: '\u0627\u0644\u0645\u0635\u0637\u0641\u0649',
    },
    description: {
      en: 'Premium quality fruit importers serving Cairo with the finest selection from around the globe since 2010.',
      ar: 'مستوردو فواكه بجودة عالية نخدم القاهرة بأفضل الاختيارات من جميع أنحاء العالم منذ عام 2010.',
    },
    address: { en: 'Cairo, Egypt', ar: 'القاهرة، مصر' },
    email: 'contact@elmostafafruits.com',
    phone: '+20 100 000 0000',
  },
};

const localizedEntries = [
  ['navbar.catalog', 'Catalog', 'الكتالوج'],
  ['navbar.blog', 'Blog', 'المدونة'],
  ['navbar.quote', 'Request Quote', 'اطلب عرض سعر'],
  ['navbar.adminLink', 'Admin Login', 'دخول الأدمن'],
  ['about.eyebrow', 'OUR STORY', 'قصتنا'],
  ['about.title', 'The Journey', 'الرحلة'],
  ['about.subtitle', 'Scroll to trace the path of perfection.', 'اسحب للأسفل لتتبع مسار المثالية.'],
  ['about.node1.title', 'The Origin', 'الأصل'],
  [
    'about.node1.desc',
    "Sourced from the world's most premium, sun-drenched orchards. We partner directly with dedicated growers to ensure excellence from the root.",
    'مستورد من أفخم البساتين المشمسة حول العالم. نحن شريك مباشر مع المزارعين لضمان التميز من الجذور.',
  ],
  ['about.node2.title', 'The Selection', 'الاختيار'],
  [
    'about.node2.desc',
    'Rigorous hand-picking and unrivaled quality control. Every single fruit is meticulously inspected to meet the El Mostafa standard of vibrancy.',
    'عملية قطف صارمة ورقابة لا تضاهى على الجودة. يتم فحص كل فاكهة بدقة لتلبية معايير المصطفى للجمال.',
  ],
  ['about.node3.title', 'The Delivery', 'التسليم'],
  [
    'about.node3.desc',
    'An unbroken cold chain bridging continents directly to Cairo. We guarantee farm-fresh crispness and an unforgettable taste in every bite.',
    'سلسلة تبريد لم تنقطع تربط القارات مباشرة بالقاهرة. نضمن لك قرمشة المزرعة الطازجة وطعماً لا يُنسى.',
  ],
  ['products.eyebrow', 'EL MOSTAFA COLLECTION', 'مجموعة المصطفى'],
  ['products.title', 'Our Harvest', 'حصادنا'],
  [
    'products.subtitle',
    'Explore our highly curated selection of the finest imported fruits globally.',
    'استكشف تشكيلتنا المختارة بعناية من أجود الفواكه المستوردة عالمياً.',
  ],
  ['products.allOrigins', 'All Origins', 'جميع المصادر'],
  ['products.filterEyebrow', 'Filter by origin', 'فلترة حسب المصدر'],
  ['products.allOriginsHint', 'Show every available product', 'عرض كل المنتجات المتاحة'],
  ['slice.title', 'The Core of\nExcellence', 'لب\nالتميز'],
  ['origins.eyebrow', 'OUR NETWORK', 'شبكتنا'],
  ['origins.title', 'Global Origins', 'مصادرنا العالمية'],
  [
    'origins.subtitle',
    "We source only from the world's most renowned agricultural regions, ensuring peak freshness and unparalleled taste from root to table.",
    'نستورد فقط من أشهر المناطق الزراعية في العالم، لضمان أعلى مستويات الطزاجة والمذاق الفريد.',
  ],
  ['whyUs.eyebrow', 'OUR COMMITMENT', 'التزامنا'],
  ['whyUs.title', 'Why El Mostafa', 'لماذا المصطفى؟'],
  [
    'whyUs.subtitle',
    'Excellence in every bite. Quality in every drop. We go beyond simple importation to deliver an unmatched standard of freshness and taste.',
    'التميز في كل قمة، الجودة في كل قطرة. نحن نتجاوز مجرد الاستيراد لتقديم مستوى لا يضاهى من الطزاجة والطعم.',
  ],
  ['whyUs.pillar1.title', 'Global Network', 'شبكة عالمية'],
  [
    'whyUs.pillar1.desc',
    'We source directly from premium farms across Italy, Greece, Kenya, and beyond to ensure peak freshness and variety.',
    'نستورد مباشرة من المزارع الفاخرة في إيطاليا واليونان وكينيا وغيرها لضمان أعلى مستويات الطزاجة والتنوع.',
  ],
  ['whyUs.pillar2.title', 'Temperature Controlled', 'التحكم في الحرارة'],
  [
    'whyUs.pillar2.desc',
    'State-of-the-art cold chain logistics guarantee our fruits arrive in Cairo exactly as pristine as nature intended.',
    'تضمن الخدمات اللوجستية المتطورة لسلسلة التبريد وصول فواكهنا إلى القاهرة تماماً كما أرادتها الطبيعة.',
  ],
  ['whyUs.pillar3.title', 'Unmatched Quality', 'جودة لا تضاهى'],
  [
    'whyUs.pillar3.desc',
    'Every single piece is hand-selected and quality-inspected to meet our rigorously high standards before it reaches you.',
    'يتم اختيار كل قطعة يدوياً وفحص جودتها لتلبية معاييرنا الصارمة قبل أن تصل إليك.',
  ],
  ['insights.regionsEyebrow', 'Growing Regions', 'مناطق النمو'],
  ['insights.regionsTitle', 'Verified sourcing regions', 'مناطق التوريد المعتمدة'],
  ['insights.milestonesEyebrow', 'Company Milestones', 'محطات الشركة'],
  ['insights.milestonesTitle', 'Export timeline', 'خط التصدير الزمني'],
  ['contact.eyebrow', 'Contact', 'تواصل معنا'],
  ['contact.title', 'Send a portfolio message', 'أرسل رسالة إلى فريق التوريد'],
  ['contact.nameLabel', 'Full Name', 'الاسم الكامل'],
  ['contact.namePlaceholder', 'Enter your full name', 'اكتب اسمك الكامل'],
  ['contact.emailLabel', 'Email Address', 'البريد الإلكتروني'],
  ['contact.emailPlaceholder', 'email@example.com', 'email@example.com'],
  ['contact.emailError', 'Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.'],
  ['contact.subjectLabel', 'Subject', 'الموضوع'],
  ['contact.subjectPlaceholder', 'What is this about?', 'بخصوص ماذا؟'],
  ['contact.messageLabel', 'Message', 'الرسالة'],
  ['contact.messagePlaceholder', 'How can we help you?', 'كيف يمكننا مساعدتك؟'],
  ['contact.submitIdle', 'Send Message', 'إرسال الرسالة'],
  ['contact.submitLoading', 'Sending...', 'جارٍ الإرسال...'],
  ['contact.success', 'Message sent.', 'تم إرسال الرسالة.'],
  ['contact.error', 'Could not send the message.', 'تعذر إرسال الرسالة.'],
  ['newsletter.eyebrow', 'Newsletter', 'النشرة البريدية'],
  ['newsletter.title', 'Stay updated on exports', 'تابع أحدث تحديثات التصدير'],
  ['newsletter.emailLabel', 'Email Address', 'البريد الإلكتروني'],
  ['newsletter.emailPlaceholder', 'email@example.com', 'email@example.com'],
  ['newsletter.submitIdle', 'Subscribe', 'اشترك الآن'],
  ['newsletter.submitLoading', 'Subscribing...', 'جارٍ الاشتراك...'],
  ['newsletter.success', 'Subscription request sent.', 'تم إرسال طلب الاشتراك.'],
  ['newsletter.error', 'Could not subscribe this email.', 'تعذر إتمام الاشتراك.'],
  ['footer.touch', 'Get in ', 'تواصل '],
  ['footer.touchColor', 'Touch', 'معنا'],
  ['footer.addressLabel', 'ADDRESS', 'العنوان'],
  ['footer.emailLabel', 'EMAIL', 'البريد الإلكتروني'],
  ['footer.phoneLabel', 'PHONE', 'الهاتف'],
  ['footer.rightsPrefix', 'Elmostafa. All rights reserved. Designed and developed by', 'المصطفى. جميع الحقوق محفوظة. التصميم والتطوير بواسطة'],
  ['footer.privacy', 'Privacy Policy', 'سياسة الخصوصية'],
  ['footer.terms', 'Terms of Service', 'شروط الخدمة'],
];

const textareaEntries = new Set([
  'about.node1.desc',
  'about.node2.desc',
  'about.node3.desc',
  'slice.title',
  'products.subtitle',
  'origins.subtitle',
  'whyUs.subtitle',
  'whyUs.pillar1.desc',
  'whyUs.pillar2.desc',
  'whyUs.pillar3.desc',
  'contact.messagePlaceholder',
  'footer.rightsPrefix',
]);

const marqueeEntries = [
  ['marquee.item.0', 'PREMIUM QUALITY', 'جودة ممتازة'],
  ['marquee.item.1', 'IMPORTED DAILY', 'مستورد يومياً'],
  ['marquee.item.2', '100% FRESH', 'طازج 100%'],
  ['marquee.item.3', 'GLOBAL ORIGINS', 'مصادر عالمية'],
  ['marquee.item.4', 'CAIRO BASED', 'مقرنا القاهرة'],
];

function getEntries() {
  const entries = [];

  for (const [nodeId, en, ar] of localizedEntries) {
    entries.push({
      nodeId,
      type: textareaEntries.has(nodeId) ? 'textarea' : 'text',
      values: { en, ar },
    });
  }

  for (const [nodeId, en, ar] of marqueeEntries) {
    entries.push({
      nodeId,
      type: 'text',
      values: { en, ar },
    });
  }

  entries.push({
    nodeId: 'slice.subtitle',
    type: 'textarea',
    values: {
      en: "Unveiling nature's finest selections, handpicked for perfection.",
      ar: 'نكتشف أرقى مختارات الطبيعة، منتقاة بعناية للوصول إلى المثالية.',
    },
  });

  return entries;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${response.statusText}\n${text}`);
  }

  return body;
}

async function login() {
  const response = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  return response.token || response.accessToken || response.data?.accessToken;
}

async function upsertCmsEntry(token, entry) {
  for (const [scope, value] of Object.entries(entry.values)) {
    await request('/cms/content', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeId: entry.nodeId,
        type: entry.type,
        scope,
        value,
      }),
    });
  }
}

async function main() {
  console.log(`Resetting site copy against ${API_BASE_URL}`);

  const token = await login();
  if (!token) {
    throw new Error('Could not obtain an admin access token.');
  }

  await request('/content', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(siteContent),
  });

  const entries = getEntries();
  for (const entry of entries) {
    await upsertCmsEntry(token, entry);
  }

  await request('/cms/content/publish', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publishAll: true }),
  });

  const currentSiteContent = await request('/content');
  const currentOverrides = await request('/overrides');

  console.log(`Updated ${entries.length} localized CMS nodes and republished content.`);
  console.log(`Navbar now: ${currentSiteContent.navbar.about.en} / ${currentSiteContent.navbar.products.en} / ${currentSiteContent.navbar.origins.en} / ${currentSiteContent.navbar.contact.en}`);
  console.log(`Published overrides count: ${Array.isArray(currentOverrides) ? currentOverrides.length : 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
