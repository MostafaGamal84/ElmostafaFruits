import { Injectable, inject, signal } from '@angular/core';
import { EditableLocale } from './site-content.service';
import { VisualOverridesApiService } from './visual-overrides-api.service';
import { VisualOverride } from '../models/visual-override.model';
import { resolveAssetUrl } from '../utils/asset-url.util';
import { readLocalStorage, writeLocalStorage } from '../utils/browser-storage.util';

export type EditorValueType = 'text' | 'textarea' | 'html' | 'image';
export type EditorValueScope = EditableLocale | 'global';

export interface EditorNodeMeta {
  nodeId: string;
  label: string;
  type: EditorValueType;
  scope: EditorValueScope;
  value: string;
}

interface EditorOverride {
  nodeId: string;
  type: EditorValueType;
  scope: EditorValueScope;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class VisualEditorService {
  private readonly visualOverridesApi = inject(VisualOverridesApiService);
  private readonly STORAGE_KEY = 'elmostafa_visual_editor_overrides_v1';
  readonly overrides = signal<Record<string, EditorOverride>>(this.loadOverrides());

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        this.overrides.set(this.loadOverrides());
      }
    });

    this.refreshOverrides();
  }

  refreshOverrides(): void {
    this.visualOverridesApi.getOverrides(true).subscribe({
      next: (overrides) => {
        this.overrides.set(this.mapOverrides(overrides));
        this.persistLocal();
      },
      error: () => {
        this.overrides.set(this.loadOverrides());
      },
    });
  }

  collectNodes(root: ParentNode, locale: EditableLocale): EditorNodeMeta[] {
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-edit-id]'));
    const deduped = new Map<string, EditorNodeMeta>();

    for (const element of elements) {
      const nodeId = element.dataset['editId'];

      if (!nodeId || deduped.has(nodeId) || element.closest('[data-editor-ignore="true"]')) {
        continue;
      }

      const type = this.getNodeType(element);
      const scope = this.getNodeScope(element, locale);
      const override = this.findOverride(nodeId, scope === 'global' ? 'global' : locale);

      deduped.set(nodeId, {
        nodeId,
        label: element.dataset['editLabel'] ?? this.humanizeNodeId(nodeId),
        type,
        scope,
        value: override?.value ?? this.readElementValue(element, type),
      });
    }

    return Array.from(deduped.values());
  }

  saveOverride(
    nodeId: string,
    value: string,
    type: EditorValueType,
    scope: EditorValueScope,
  ): void {
    this.overrides.update((current) => ({
      ...current,
      [this.makeKey(nodeId, scope)]: {
        nodeId,
        value,
        type,
        scope,
      },
    }));

    this.persistLocal();
    this.visualOverridesApi.saveOverride({ nodeId, value, type, scope }).subscribe({
      error: () => undefined,
    });
  }

  applyOverrides(root: ParentNode, locale: EditableLocale): void {
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-edit-id]'));

    for (const element of elements) {
      const nodeId = element.dataset['editId'];

      if (!nodeId) {
        continue;
      }

      const type = this.getNodeType(element);
      const scope = this.getNodeScope(element, locale);
      const override = this.findOverride(nodeId, scope === 'global' ? 'global' : locale);

      if (!override) {
        continue;
      }

      this.writeElementValue(element, override.value, type);
    }
  }

  applyOverrideToFrame(
    root: ParentNode,
    nodeId: string,
    value: string,
    type: EditorValueType,
    excludedElement?: HTMLElement,
  ): void {
    const elements = Array.from(root.querySelectorAll<HTMLElement>(`[data-edit-id="${nodeId}"]`));

    for (const element of elements) {
      if (excludedElement && element === excludedElement) {
        continue;
      }

      this.writeElementValue(element, value, type);
    }
  }

  private readElementValue(element: HTMLElement, type: EditorValueType): string {
    if (type === 'image' && element instanceof HTMLImageElement) {
      return element.getAttribute('src') ?? '';
    }

    if (type === 'html') {
      return element.innerHTML.trim();
    }

    if (type === 'textarea') {
      return this.normalizePlainTextValue(element.innerText ?? '');
    }

    return (element.textContent ?? '')
      .replace(/\u00A0/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  private writeElementValue(element: HTMLElement, value: string, type: EditorValueType): void {
    if (type === 'image' && element instanceof HTMLImageElement) {
      element.src = resolveAssetUrl(value);
      return;
    }

    if (type === 'html') {
      element.innerHTML = value;
      return;
    }

    if (type === 'textarea') {
      element.innerText = this.normalizePlainTextValue(value);
      return;
    }

    element.textContent = this.normalizePlainTextValue(value);
  }

  private normalizePlainTextValue(value: string): string {
    return String(value ?? '').replace(/<br\s*\/?>/gi, '\n');
  }

  private getNodeType(element: HTMLElement): EditorValueType {
    const declaredType = element.dataset['editType'] as EditorValueType | undefined;

    if (declaredType) {
      return declaredType;
    }

    if (element instanceof HTMLImageElement) {
      return 'image';
    }

    const textLength = (element.textContent ?? '').trim().length;
    return textLength > 100 ? 'textarea' : 'text';
  }

  private getNodeScope(element: HTMLElement, locale: EditableLocale): EditorValueScope {
    const declaredScope = element.dataset['editScope'] as EditorValueScope | undefined;
    return declaredScope ?? locale;
  }

  private findOverride(nodeId: string, scope: EditorValueScope): EditorOverride | null {
    const allOverrides = this.overrides();
    const scopedOverride = allOverrides[this.makeKey(nodeId, scope)];

    if (scopedOverride) {
      return scopedOverride;
    }

    if (scope !== 'global') {
      return allOverrides[this.makeKey(nodeId, 'global')] ?? null;
    }

    return null;
  }

  private makeKey(nodeId: string, scope: EditorValueScope): string {
    return `${scope}::${nodeId}`;
  }

  private mapOverrides(overrides: VisualOverride[]): Record<string, EditorOverride> {
    return overrides.reduce<Record<string, EditorOverride>>((acc, override) => {
      if (!this.hasUsableValue(override.value)) {
        return acc;
      }

      acc[this.makeKey(override.nodeId, override.scope as EditorValueScope)] = {
        nodeId: override.nodeId,
        type: override.type as EditorValueType,
        scope: override.scope as EditorValueScope,
        value: override.value,
      };
      return acc;
    }, {});
  }

  private humanizeNodeId(nodeId: string): string {
    return nodeId
      .split('.')
      .map((chunk) => chunk.replace(/[-_]/g, ' '))
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' / ');
  }

  private loadOverrides(): Record<string, EditorOverride> {
    const raw = readLocalStorage(this.STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, EditorOverride>;
      return Object.entries(parsed).reduce<Record<string, EditorOverride>>((acc, [key, override]) => {
        if (override && this.hasUsableValue(override.value)) {
          acc[key] = override;
        }

        return acc;
      }, {});
    } catch {
      return {};
    }
  }

  private hasUsableValue(value: string | null | undefined): boolean {
    return String(value ?? '').trim().length > 0;
  }

  private persistLocal(): void {
    writeLocalStorage(this.STORAGE_KEY, JSON.stringify(this.overrides()));
  }
}
