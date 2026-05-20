export interface AboutPageText {
  en: string;
  ar: string;
}

export interface AboutPageSection {
  id: string;
  imageUrl: string;
  navLabel: AboutPageText;
  title: AboutPageText;
  body: AboutPageText;
}

export interface AboutPageContent {
  heroTitle: AboutPageText;
  heroSubtitle: AboutPageText;
  sections: AboutPageSection[];
}

export const ABOUT_PAGE_SETTING_KEY = 'about.page.config';

const DEFAULT_SECTIONS: AboutPageSection[] = [
  {
    id: 'about-section-1',
    imageUrl: 'assets/real-apple.png',
    navLabel: {
      en: 'About Us',
      ar: 'من نحن',
    },
    title: {
      en: 'Who We Are',
      ar: 'من نحن',
    },
    body: {
      en: 'El Mostafa Fruits builds trusted partnerships between premium growers and the Egyptian market through careful sourcing, quality control, and dependable supply.',
      ar: 'تربط شركة المصطفى فروتس بين أفضل المزارع والأسواق المصرية من خلال التوريد الموثوق، وضبط الجودة، والالتزام في الإمداد.',
    },
  },
  {
    id: 'about-section-2',
    imageUrl: 'assets/real-splash.png',
    navLabel: {
      en: 'Our Business',
      ar: 'أعمالنا',
    },
    title: {
      en: 'How We Work',
      ar: 'كيف نعمل',
    },
    body: {
      en: 'Our work covers sourcing, shipping coordination, cold-chain handling, and daily market support so every order arrives fresh and ready for business.',
      ar: 'يشمل عملنا التوريد، وتنسيق الشحن، وإدارة سلسلة التبريد، ودعم السوق اليومي حتى تصل كل شحنة طازجة وجاهزة للعمل.',
    },
  },
  {
    id: 'about-section-3',
    imageUrl: 'assets/real-avocado-cutout.png',
    navLabel: {
      en: 'Why El Mostafa',
      ar: 'لماذا المصطفى',
    },
    title: {
      en: 'Built On Consistency',
      ar: 'مبنيون على الثبات',
    },
    body: {
      en: 'We focus on clear communication, stable quality, and long-term relationships that help customers and growers move with confidence.',
      ar: 'نركز على التواصل الواضح، والجودة الثابتة، والعلاقات طويلة المدى التي تمنح العملاء والمزارعين ثقة أكبر في كل خطوة.',
    },
  },
];

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  heroTitle: {
    en: 'Our Story',
    ar: 'قصتنا',
  },
  heroSubtitle: {
    en: 'A dedicated About Us page with curated sections, rich backgrounds, and admin-managed storytelling.',
    ar: 'صفحة من نحن مخصصة بالكامل، بسرد مرن، وخلفيات بصرية، وتحكم كامل من لوحة الإدارة.',
  },
  sections: DEFAULT_SECTIONS,
};

export function cloneAboutPageContent(
  content: AboutPageContent = DEFAULT_ABOUT_PAGE_CONTENT,
): AboutPageContent {
  return {
    heroTitle: { ...content.heroTitle },
    heroSubtitle: { ...content.heroSubtitle },
    sections: content.sections.map((section) => ({
      id: section.id,
      imageUrl: section.imageUrl,
      navLabel: { ...section.navLabel },
      title: { ...section.title },
      body: { ...section.body },
    })),
  };
}

export function createAboutPageSection(index: number): AboutPageSection {
  const sectionNumber = index + 1;

  return {
    id: `about-section-${Date.now()}-${sectionNumber}`,
    imageUrl: '',
    navLabel: {
      en: `Section ${sectionNumber}`,
      ar: `القسم ${sectionNumber}`,
    },
    title: {
      en: `Section ${sectionNumber} Title`,
      ar: `عنوان القسم ${sectionNumber}`,
    },
    body: {
      en: 'Write the section summary here.',
      ar: 'اكتب وصف هذا القسم هنا.',
    },
  };
}

export function parseAboutPageContent(raw: string | null | undefined): AboutPageContent {
  if (!raw) {
    return cloneAboutPageContent();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeAboutPageContent(parsed);
  } catch {
    return cloneAboutPageContent();
  }
}

function normalizeAboutPageContent(value: unknown): AboutPageContent {
  const fallback = cloneAboutPageContent();

  if (!isRecord(value)) {
    return fallback;
  }

  const sections = Array.isArray(value['sections'])
    ? value['sections']
        .map((section, index) => normalizeAboutPageSection(section, index))
        .filter((section): section is AboutPageSection => section !== null)
    : [];

  return {
    heroTitle: normalizeText(value['heroTitle'], fallback.heroTitle),
    heroSubtitle: normalizeText(value['heroSubtitle'], fallback.heroSubtitle),
    sections: sections.length > 0 ? sections : fallback.sections,
  };
}

function normalizeAboutPageSection(value: unknown, index: number): AboutPageSection | null {
  if (!isRecord(value)) {
    return null;
  }

  const fallback = DEFAULT_SECTIONS[index] ?? createAboutPageSection(index);

  return {
    id: normalizeSectionId(value['id'], index),
    imageUrl: normalizeString(value['imageUrl'], fallback.imageUrl),
    navLabel: normalizeText(value['navLabel'], fallback.navLabel),
    title: normalizeText(value['title'], fallback.title),
    body: normalizeText(value['body'], fallback.body),
  };
}

function normalizeText(value: unknown, fallback: AboutPageText): AboutPageText {
  if (typeof value === 'string') {
    const normalized = value.trim();

    if (!normalized) {
      return { ...fallback };
    }

    return {
      en: normalized,
      ar: fallback.ar,
    };
  }

  if (!isRecord(value)) {
    return { ...fallback };
  }

  return {
    en: normalizeString(value['en'], fallback.en),
    ar: normalizeString(value['ar'], fallback.ar),
  };
}

function normalizeSectionId(value: unknown, index: number): string {
  const normalized = normalizeString(value, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `about-section-${index + 1}`;
}

function normalizeString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
