export interface CmsContentEntry {
  id: string;
  nodeId: string;
  type: string;
  scope: string;
  value: string;
  stage: 'draft' | 'published';
  updatedAt: string;
  publishedAt?: string | null;
}

export interface CmsContentEntryUpsertPayload {
  nodeId: string;
  type: string;
  scope: string;
  value: string;
}

export interface CmsSiteSetting {
  id: string;
  key: string;
  type: string;
  value: string;
  stage: 'draft' | 'published';
  updatedAt: string;
  publishedAt?: string | null;
}

export interface CmsSiteSettingUpsertPayload {
  key: string;
  type: string;
  value: string;
}

export interface CmsMediaAsset {
  id: string;
  fileName: string;
  originalFileName: string;
  url: string;
  folder: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
}
