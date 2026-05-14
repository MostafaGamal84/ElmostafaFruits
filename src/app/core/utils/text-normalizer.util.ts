const WINDOWS_1252_EXTENDED_MAP: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f,
};

const MOJIBAKE_PATTERN = /(?:Ã|Â|â|ðŸ|Ø|Ù|Ð|Ñ|Å|Æ|œ|Œ|�)/;

export function repairText(value: string | null | undefined): string {
  const initial = String(value ?? '');

  if (!initial || !looksBroken(initial)) {
    return initial;
  }

  let repaired = initial;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const decoded = decodeBrokenUtf8(repaired);

    if (!decoded || decoded === repaired) {
      break;
    }

    repaired = decoded;
  }

  return repaired;
}

export function repairDeepText<T>(payload: T): T {
  return normalizeValue(payload) as T;
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return repairText(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry));
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
    next[key] = normalizeValue(entry);
  }

  return next;
}

function looksBroken(value: string): boolean {
  return MOJIBAKE_PATTERN.test(value);
}

function decodeBrokenUtf8(value: string): string | null {
  const bytes: number[] = [];

  for (const char of value) {
    if (char in WINDOWS_1252_EXTENDED_MAP) {
      bytes.push(WINDOWS_1252_EXTENDED_MAP[char]);
      continue;
    }

    const code = char.charCodeAt(0);

    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }

    return null;
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}
