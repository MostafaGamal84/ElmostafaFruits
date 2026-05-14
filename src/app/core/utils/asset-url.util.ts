import { API_ROOT_URL } from '../config/api.config';

const FALLBACK_ORIGIN = 'http://localhost';
const API_ORIGIN = resolveApiOrigin(API_ROOT_URL);
const ASSET_FIELDS = new Set(['url', 'imageUrl', 'coverImageUrl']);

export function resolveAssetUrl(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();

  if (!normalized || normalized === '/') {
    return normalized;
  }

  if (
    normalized.startsWith('//') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://')
  ) {
    return normalized;
  }

  if (normalized.startsWith('assets/')) {
    return normalized;
  }
  if (normalized.startsWith('/assets/')) {
    return normalized.substring(1);
  }
  if (normalized.startsWith('./assets/')) {
    return normalized.substring(2);
  }

  if (normalized.startsWith('uploads/')) {
    return `${API_ORIGIN}/${normalized}`;
  }
  if (normalized.startsWith('/uploads/')) {
    return `${API_ORIGIN}${normalized}`;
  }

  return normalized;
}

export function toStoredAssetUrl(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('assets/') || normalized.startsWith('/assets/')) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  if (normalized.startsWith('uploads/') || normalized.startsWith('/uploads/')) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  return normalized;
}

export function normalizeApiAssetPayload<T>(payload: T): T {
  return normalizeValue(payload) as T;
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date || value instanceof Blob || value instanceof ArrayBuffer) {
    return value;
  }

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry === 'string' && ASSET_FIELDS.has(key)) {
      next[key] = resolveAssetUrl(entry);
      continue;
    }

    if (key === 'value' && typeof entry === 'string' && isImageSetting(record)) {
      next[key] = resolveAssetUrl(entry);
      continue;
    }

    if (key === 'brand.logo' && typeof entry === 'string') {
      next[key] = resolveAssetUrl(entry);
      continue;
    }

    next[key] = normalizeValue(entry);
  }

  return next;
}

function isImageSetting(record: Record<string, unknown>): boolean {
  return record['type'] === 'image' || record['key'] === 'brand.logo';
}

function resolveApiOrigin(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();
  const browserOrigin = getBrowserOrigin();

  if (!normalized) {
    return browserOrigin;
  }

  try {
    return new URL(normalized, browserOrigin).origin;
  } catch {
    return browserOrigin;
  }
}

function getBrowserOrigin(): string {
  const origin = globalThis.location?.origin;
  return typeof origin === 'string' && origin ? origin : FALLBACK_ORIGIN;
}
