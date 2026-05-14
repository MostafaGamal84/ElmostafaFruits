import { Origin } from '../../domain/models/origin.model';

export class OriginMapper {
  static fromJson(json: any): Origin {
    return {
      id: json.id,
      flag: typeof json.flag === 'string' && json.flag.trim() ? json.flag : (json.id ?? ''),
      country: json.country,
      country_ar: json.country_ar,
      products: (json.products ?? []) as string[],
      latitude: typeof json.latitude === 'number' ? json.latitude : null,
      longitude: typeof json.longitude === 'number' ? json.longitude : null,
    };
  }
}
