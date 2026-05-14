import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import {
  EditableLocale,
  SiteContentService,
} from '../../../core/services/site-content.service';
import {
  EditorNodeMeta,
  EditorValueScope,
  EditorValueType,
  VisualEditorService,
} from '../../../core/services/visual-editor.service';
import { CmsApiService } from '../../../core/services/cms-api.service';
import { UploadsApiService } from '../../../core/services/uploads-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { resolveAssetUrl, toStoredAssetUrl } from '../../../core/utils/asset-url.util';

@Component({
  selector: 'app-admin-visual-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="editor-screen">
      <div class="editor-controls">
        <div class="locale-switch">
          <button type="button" [class.active]="locale() === 'en'" (click)="setLocale('en')">
            EN
          </button>
          <button type="button" [class.active]="locale() === 'ar'" (click)="setLocale('ar')">
            AR
          </button>
        </div>

        <button type="button" class="ghost" (click)="saveChanges()">Save Draft</button>
        <button
          type="button"
          class="primary"
          (click)="publishChanges()"
          [disabled]="publishing() || uploading()"
        >
          {{ publishing() ? 'Publishing...' : 'Publish Live' }}
        </button>
      </div>

      <div class="preview-card">
        <iframe
          #previewFrame
          class="preview-frame"
          [src]="previewUrl()"
          (load)="onPreviewLoad()"
        ></iframe>
      </div>

      <div class="status-bar" *ngIf="status()">{{ status() }}</div>

      <div class="selection-card" *ngIf="selectedNodeId() as activeNode">
        <div class="editor-head">
          <div>
            <strong>{{ selectedLabel() }}</strong>
            <small>{{ activeNode }}</small>
          </div>
          <button type="button" class="dismiss-button" (click)="clearSelection()">Close</button>
        </div>

        <ng-container *ngIf="selectedType() === 'image'; else inlineMode">
          <div class="image-preview-shell" *ngIf="selectedMediaUrl() as imageUrl">
            <img [src]="imageUrl" [alt]="selectedLabel() || 'Selected image'" />
          </div>

          <input
            #imagePicker
            class="hidden-picker"
            type="file"
            accept="image/*"
            (change)="onImageSelected($event)"
            [disabled]="uploading()"
          />

          <button
            type="button"
            class="upload-cta"
            [class.disabled]="uploading()"
            (click)="openImagePicker()"
            [disabled]="uploading()"
          >
            <span>{{ uploading() ? 'Uploading image...' : 'Choose replacement image' }}</span>
          </button>

          <p class="editor-hint">
            Clicking a static image in the preview opens file upload directly. Logo changes now
            happen here inside Live Editor.
          </p>

          <p class="editor-hint" *ngIf="selectedNodeId() === 'navbar.logo'">
            After you choose a logo file, the navbar preview updates immediately and stays in the
            current draft until you publish it live.
          </p>

          <p class="editor-hint" *ngIf="selectedNodeId() !== 'navbar.logo'">
            The image uploads into NewApi media storage first, then saves to the draft instantly.
          </p>
        </ng-container>

        <ng-template #inlineMode>
          <div class="inline-copy">
            <p class="editor-hint">
              Click the highlighted copy inside the preview and type there directly. Draft changes
              auto-save after a brief pause.
            </p>

            <div class="inline-actions">
              <button type="button" class="ghost" (click)="focusSelectedNode()">Focus Field</button>
              <button
                type="button"
                class="ghost"
                (click)="saveChanges()"
                [disabled]="publishing() || uploading()"
              >
                Save Now
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .editor-screen {
        display: grid;
        gap: 14px;
        min-height: calc(100vh - 150px);
      }

      .editor-controls,
      .status-bar,
      .selection-card,
      .preview-card {
        border-radius: 26px;
        border: 1px solid var(--border-color);
        background: var(--card-bg) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          background 0.4s ease,
          border-color 0.4s ease;
      }

      .editor-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        padding: 14px 16px;
      }

      .locale-switch {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .status-bar,
      .editor-hint,
      .editor-head small {
        color: var(--text-secondary);
        font-size: 0.88rem;
      }

      .status-bar {
        padding: 10px 14px;
        border-radius: 18px;
      }

      .selection-card {
        padding: 16px;
        display: grid;
        gap: 14px;
      }

      .editor-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .editor-head strong {
        display: block;
        color: var(--text-primary);
        font-size: 1rem;
        margin-bottom: 4px;
      }

      .dismiss-button,
      .locale-switch button,
      .ghost,
      .primary {
        border: none;
        border-radius: 14px;
        padding: 10px 14px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        transition: all 0.25s ease;
      }

      .dismiss-button,
      .locale-switch button,
      .ghost {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-size: 0.82rem;
      }

      .dismiss-button:hover,
      .locale-switch button:hover,
      .ghost:hover {
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.35);
      }

      .locale-switch button.active {
        background: rgba(245, 124, 0, 0.12);
        border-color: rgba(245, 124, 0, 0.35);
        color: var(--color-primary);
      }

      .primary {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
      }

      button:disabled,
      .upload-cta.disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .inline-copy {
        display: grid;
        gap: 12px;
      }

      .inline-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .image-preview-shell {
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid rgba(245, 124, 0, 0.18);
        background: rgba(245, 124, 0, 0.04);
        aspect-ratio: 16 / 9;
      }

      .image-preview-shell img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .upload-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 12px 16px;
        border-radius: 16px;
        border: 1px dashed rgba(245, 124, 0, 0.4);
        background: rgba(245, 124, 0, 0.08);
        color: var(--text-primary);
        font-weight: 700;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .hidden-picker {
        display: none;
      }

      .preview-card {
        overflow: hidden;
        min-height: calc(100vh - 150px);
      }

      .preview-frame {
        width: 100%;
        height: 100%;
        min-height: calc(100vh - 150px);
        border: none;
        background: var(--bg-primary);
      }

      @media (max-width: 960px) {
        .editor-controls {
          display: grid;
          grid-template-columns: 1fr;
        }

        .preview-frame {
          min-height: 720px;
        }
      }

      @media (max-width: 640px) {
        .editor-controls,
        .selection-card {
          padding: 14px;
        }
      }
    `,
  ],
})
export class AdminVisualEditorComponent implements OnInit, OnDestroy {
  private readonly language = inject(LanguageService);
  private readonly siteContent = inject(SiteContentService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly visualEditor = inject(VisualEditorService);
  private readonly cmsApi = inject(CmsApiService);
  private readonly uploadsApi = inject(UploadsApiService);

  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;
  @ViewChild('imagePicker') imagePicker?: ElementRef<HTMLInputElement>;

  readonly locale = signal<EditableLocale>('en');
  readonly selectedNodeId = signal<string | null>(null);
  readonly selectedValue = signal('');
  readonly publishing = signal(false);
  readonly uploading = signal(false);
  readonly status = signal(
    'Click any highlighted static element in the preview. Text edits happen directly on the page.',
  );
  readonly nodes = signal<EditorNodeMeta[]>([]);
  readonly draftEntries = signal<Record<string, string>>({});
  readonly draftSettings = signal<Record<string, string>>({});
  readonly previewUrl = signal<SafeResourceUrl>(this.buildPreviewUrl('en'));

  readonly activeNode = computed(
    () => this.nodes().find((node) => node.nodeId === this.selectedNodeId()) ?? null,
  );
  readonly selectedLabel = computed(() => this.activeNode()?.label ?? '');
  readonly selectedType = computed(() => this.activeNode()?.type ?? 'text');
  readonly selectedMediaUrl = computed(() => {
    const activeNode = this.activeNode();
    return activeNode && activeNode.type === 'image'
      ? resolveAssetUrl(this.readDraftValue(activeNode))
      : '';
  });
  private readonly inlineInputHandlers = new Map<HTMLElement, EventListener>();
  private readonly inlineFocusHandlers = new Map<HTMLElement, EventListener>();
  private readonly inlineOriginalDir = new Map<HTMLElement, string | null>();
  private readonly inlineOriginalUnicodeBidi = new Map<HTMLElement, string | null>();
  private readonly inlineOriginalTextAlign = new Map<HTMLElement, string | null>();
  private readonly pendingSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pendingSaveValues = new Map<string, { node: EditorNodeMeta; value: string }>();

  private readonly messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === 'editor-locale-changed') {
      const locale = event.data.payload?.locale;

      if (locale === 'en' || locale === 'ar') {
        this.syncLocaleFromPreview(locale);
      }

      return;
    }

    if (event.data?.type !== 'editor-node-selected') {
      return;
    }

    const { nodeId, value } = event.data.payload || {};

    if (!nodeId) {
      return;
    }

    this.selectNode(nodeId, value);
  };

  ngOnInit(): void {
    this.loadDraftState();
    this.reloadPreview();
    window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.clearPendingTimers();
    this.unregisterInlineEditors();
  }

  setLocale(locale: EditableLocale): void {
    this.locale.set(locale);
    this.reloadPreview();
    this.clearSelection(false);
    this.status.set(
      `Reloaded the live editor in ${locale.toUpperCase()} mode and kept the current draft ready.`,
    );
  }

  saveChanges(): void {
    this.flushPendingSaves(true);
  }

  publishChanges(): void {
    if (this.publishing()) {
      return;
    }

    this.publishing.set(true);
    this.status.set('Publishing the latest NewApi CMS draft to the live site...');

    this.flushPendingSaves(false, () => {
      forkJoin([this.cmsApi.publishContent(), this.cmsApi.publishSettings()]).subscribe({
        next: () => {
          this.siteContent.refreshContent();
          this.language.refreshRemoteContent();
          this.visualEditor.refreshOverrides();
          this.publishing.set(false);
          this.reloadPreview();
          this.status.set('Published all current draft content and settings to the live site.');
        },
        error: () => {
          this.publishing.set(false);
          this.status.set('Could not publish the live site right now.');
        },
      });
    });
  }

  onImageSelected(event: Event): void {
    const activeNode = this.activeNode();
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!activeNode || activeNode.type !== 'image' || !file) {
      return;
    }

    this.uploading.set(true);
    this.status.set(`Uploading a replacement image for ${activeNode.label}...`);

    this.uploadsApi.uploadImage(file, this.getUploadFolder(activeNode.nodeId)).subscribe({
      next: (result) => {
        this.stageDraftValue(activeNode, result.url, false);

        const saveRequest = this.buildSaveRequest(activeNode, result.url);
        saveRequest.subscribe({
          next: () => {
            this.uploading.set(false);
            this.applyValueToPreview(activeNode.nodeId, result.url, 'image');
            this.status.set(
              `Uploaded and saved ${activeNode.label} into the current CMS draft.`,
            );
          },
          error: () => {
            this.uploading.set(false);
            this.status.set('The image uploaded, but the draft value could not be stored.');
          },
        });

        if (input) {
          input.value = '';
        }
      },
      error: () => {
        this.uploading.set(false);
        this.status.set('Could not upload that image right now.');
      },
    });
  }

  onPreviewLoad(): void {
    if (!this.isAllowedPreviewLocation()) {
      this.clearSelection(false);
      this.reloadPreview();
      this.status.set(
        'Live editor preview is limited to the public home page only. Reloaded the site preview.',
      );
      return;
    }

    this.scanNodes();

    setTimeout(() => {
      if (this.nodes().length === 0) {
        this.scanNodes();
      }
    }, 800);

    setTimeout(() => {
      if (this.nodes().length === 0) {
        this.scanNodes();
      }
    }, 2000);
  }

  selectNode(nodeId: string, providedValue?: string): void {
    const activeNode = this.nodes().find((node) => node.nodeId === nodeId);

    if (!activeNode) {
      return;
    }

    this.selectedNodeId.set(nodeId);
    this.selectedValue.set(providedValue ?? this.readDraftValue(activeNode));
    this.highlightSelectedNode(nodeId);

    if (activeNode.type === 'image') {
      this.status.set(`Ready to replace ${activeNode.label}. Choose a file to update it.`);
      setTimeout(() => this.openImagePicker());
      return;
    }

    this.status.set(`Editing ${activeNode.label} directly on the preview. Draft auto-save is on.`);
    queueMicrotask(() => this.focusSelectedNode());
  }

  focusSelectedNode(): void {
    const activeNode = this.activeNode();
    const documentRef = this.previewFrame?.nativeElement.contentDocument;

    if (!activeNode || !documentRef || activeNode.type === 'image') {
      return;
    }

    const element = documentRef.querySelector<HTMLElement>(`[data-edit-id="${activeNode.nodeId}"]`);
    if (!element) {
      return;
    }

    this.focusNodeElement(element);
  }

  clearSelection(updateStatus = true): void {
    this.selectedNodeId.set(null);
    this.selectedValue.set('');

    const documentRef = this.previewFrame?.nativeElement.contentDocument;
    documentRef
      ?.querySelectorAll('.editor-node-selected')
      .forEach((element) => element.classList.remove('editor-node-selected'));

    if (updateStatus) {
      this.status.set('Selection cleared. Choose another highlighted element to keep editing.');
    }
  }

  openImagePicker(): void {
    if (this.uploading() || this.selectedType() !== 'image') {
      return;
    }

    this.imagePicker?.nativeElement.click();
  }

  private loadDraftState(): void {
    forkJoin({
      content: this.cmsApi.getContent('draft'),
      settings: this.cmsApi.getSettings('draft'),
    }).subscribe({
      next: ({ content, settings }) => {
        const contentMap = content.reduce<Record<string, string>>((acc, entry) => {
          acc[this.makeStorageKey(entry.nodeId, entry.scope as EditorValueScope)] = entry.value;
          return acc;
        }, {});

        const settingsMap = settings.reduce<Record<string, string>>((acc, entry) => {
          acc[entry.key] = entry.value;
          return acc;
        }, {});

        this.draftEntries.set(contentMap);
        this.draftSettings.set(settingsMap);
        this.applyDraftStateToPreview();
      },
      error: () => {
        this.status.set('Preview loaded, but draft CMS data could not be fetched right now.');
      },
    });
  }

  private scanNodes(): void {
    const documentRef = this.previewFrame?.nativeElement.contentDocument;

    if (!documentRef) {
      return;
    }

    const scannedNodes = this.visualEditor
      .collectNodes(documentRef, this.locale())
      .map((node) => this.normalizeNode(node))
      .filter((node) => this.isEditableNode(node));

    this.nodes.set(scannedNodes);
    this.syncEditableTargets(documentRef, scannedNodes);
    this.applyDraftStateToPreview(documentRef);

    this.status.set(
      `Loaded ${scannedNodes.length} editable static nodes. Click the preview and type in place.`,
    );
  }

  private normalizeNode(node: EditorNodeMeta): EditorNodeMeta {
    if (this.isGlobalVisualNode(node.nodeId)) {
      return { ...node, scope: 'global' };
    }

    return node;
  }

  private syncEditableTargets(documentRef: Document, nodes: EditorNodeMeta[]): void {
    this.unregisterInlineEditors();

    documentRef
      .querySelectorAll('.editor-editable-node')
      .forEach((element) => element.classList.remove('editor-editable-node'));

    documentRef
      .querySelectorAll('.editor-inline-target')
      .forEach((element) => element.classList.remove('editor-inline-target'));

    const allowedNodeIds = new Set(nodes.map((node) => node.nodeId));

    nodes.forEach((node) => {
      documentRef
        .querySelectorAll<HTMLElement>(`[data-edit-id="${node.nodeId}"]`)
        .forEach((element) => {
          element.classList.add('editor-editable-node');

          if (node.type === 'image') {
            return;
          }

          element.classList.add('editor-inline-target');
          element.setAttribute('contenteditable', 'true');
          element.setAttribute('spellcheck', 'true');
          this.prepareInlineDirection(element);

          const inputHandler: EventListener = () => {
            this.refreshInlineDirection(element);
            const nextValue = this.readElementValue(element, node.type);
            this.selectedNodeId.set(node.nodeId);
            this.selectedValue.set(nextValue);
            this.applyValueToPreview(node.nodeId, nextValue, node.type, element);
            this.stageDraftValue(node, nextValue, true);
          };

          const focusHandler: EventListener = () => {
            this.refreshInlineDirection(element);
            this.selectedNodeId.set(node.nodeId);
            this.selectedValue.set(this.readDraftValue(node));
            this.highlightSelectedNode(node.nodeId);
          };

          element.addEventListener('input', inputHandler);
          element.addEventListener('focus', focusHandler);

          this.inlineInputHandlers.set(element, inputHandler);
          this.inlineFocusHandlers.set(element, focusHandler);
        });
    });

    const selectedNodeId = this.selectedNodeId();
    if (selectedNodeId && !allowedNodeIds.has(selectedNodeId)) {
      this.clearSelection(false);
    }
  }

  private unregisterInlineEditors(): void {
    this.inlineInputHandlers.forEach((handler, element) => {
      element.removeEventListener('input', handler);
      element.removeAttribute('contenteditable');
      element.removeAttribute('spellcheck');
      element.classList.remove('editor-inline-target');
      this.restoreInlineDirection(element);
    });

    this.inlineFocusHandlers.forEach((handler, element) => {
      element.removeEventListener('focus', handler);
    });

    this.inlineInputHandlers.clear();
    this.inlineFocusHandlers.clear();
    this.inlineOriginalDir.clear();
    this.inlineOriginalUnicodeBidi.clear();
    this.inlineOriginalTextAlign.clear();
  }

  private stageDraftValue(node: EditorNodeMeta, value: string, autoSave: boolean): void {
    this.selectedValue.set(value);
    this.updateDraftMaps(node, value);

    if (autoSave) {
      this.scheduleDraftSave(node, value);
    }
  }

  private updateDraftMaps(node: EditorNodeMeta, value: string): void {
    if (this.isSettingNode(node.nodeId)) {
      const key = this.getSettingKey(node.nodeId);
      this.draftSettings.update((current) => ({
        ...current,
        [key]: value,
      }));
      return;
    }

    const storageKey = this.makeStorageKey(node.nodeId, node.scope);
    this.draftEntries.update((current) => ({
      ...current,
      [storageKey]: value,
    }));
  }

  private scheduleDraftSave(node: EditorNodeMeta, value: string): void {
    const key = this.makeStorageKey(node.nodeId, node.scope);
    const existingTimer = this.pendingSaveTimers.get(key);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    this.pendingSaveValues.set(key, { node, value });
    this.status.set(`Saving ${node.label} to draft...`);

    const timer = setTimeout(() => {
      this.pendingSaveTimers.delete(key);
      this.persistPendingValue(key);
    }, 450);

    this.pendingSaveTimers.set(key, timer);
  }

  private persistPendingValue(key: string): void {
    const pending = this.pendingSaveValues.get(key);

    if (!pending) {
      return;
    }

    this.buildSaveRequest(pending.node, pending.value).subscribe({
      next: () => {
        this.pendingSaveValues.delete(key);
        this.status.set(`${pending.node.label} saved to the current CMS draft.`);
      },
      error: () => {
        this.status.set(`Could not save ${pending.node.label} to draft right now.`);
      },
    });
  }

  private flushPendingSaves(notify: boolean, onComplete?: () => void): void {
    const pendingEntries = Array.from(this.pendingSaveValues.values());
    this.clearPendingTimers();

    if (pendingEntries.length === 0) {
      if (notify) {
        this.status.set('No unsaved draft changes are waiting right now.');
      }
      onComplete?.();
      return;
    }

    if (notify) {
      this.status.set('Saving all current draft changes to NewApi CMS...');
    }

    const requests = pendingEntries.map((entry) => this.buildSaveRequest(entry.node, entry.value));
    this.pendingSaveValues.clear();

    forkJoin(requests).subscribe({
      next: () => {
        if (notify) {
          this.status.set('All current inline edits were saved to the CMS draft.');
        }
        onComplete?.();
      },
      error: () => {
        this.status.set('Could not save the current batch of draft changes.');
      },
    });
  }

  private clearPendingTimers(): void {
    this.pendingSaveTimers.forEach((timer) => clearTimeout(timer));
    this.pendingSaveTimers.clear();
  }

  private buildSaveRequest(node: EditorNodeMeta, value: string): Observable<unknown> {
    const normalizedValue =
      node.type === 'image'
        ? toStoredAssetUrl(value)
        : node.type === 'html'
          ? value
          : this.normalizePlainTextValue(value);

    if (this.isSettingNode(node.nodeId)) {
      return this.cmsApi.upsertSetting({
        key: this.getSettingKey(node.nodeId),
        type: node.type,
        value: normalizedValue,
      });
    }

    return this.cmsApi.upsertContent({
      nodeId: node.nodeId,
      type: node.type,
      scope: node.scope,
      value: normalizedValue,
    });
  }

  private readDraftValue(node: EditorNodeMeta): string {
    if (this.isSettingNode(node.nodeId)) {
      return this.draftSettings()[this.getSettingKey(node.nodeId)] || node.value || '';
    }

    const value =
      this.draftEntries()[this.makeStorageKey(node.nodeId, node.scope)] || node.value || '';

    return node.type === 'html' ? value : this.normalizePlainTextValue(value);
  }

  private applyDraftStateToPreview(documentRef?: Document): void {
    const root = documentRef ?? this.previewFrame?.nativeElement.contentDocument;

    if (!root) {
      return;
    }

    this.nodes().forEach((node) => {
      const value = this.readDraftValue(node);

      if (!value) {
        return;
      }

      this.visualEditor.applyOverrideToFrame(root, node.nodeId, value, node.type);
    });
  }

  private applyValueToPreview(
    nodeId: string,
    value: string,
    type: EditorValueType,
    excludedElement?: HTMLElement,
  ): void {
    const documentRef = this.previewFrame?.nativeElement.contentDocument;

    if (!documentRef) {
      return;
    }

    this.visualEditor.applyOverrideToFrame(documentRef, nodeId, value, type, excludedElement);
  }

  private highlightSelectedNode(nodeId: string): void {
    const documentRef = this.previewFrame?.nativeElement.contentDocument;

    if (!documentRef) {
      return;
    }

    documentRef
      .querySelectorAll('.editor-node-selected')
      .forEach((element) => element.classList.remove('editor-node-selected'));

    documentRef
      .querySelectorAll<HTMLElement>(`[data-edit-id="${nodeId}"]`)
      .forEach((element) => element.classList.add('editor-node-selected'));
  }

  private focusNodeElement(element: HTMLElement): void {
    element.focus();

    const selection = element.ownerDocument.defaultView?.getSelection();
    if (!selection) {
      return;
    }

    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  private prepareInlineDirection(element: HTMLElement): void {
    if (!this.inlineOriginalDir.has(element)) {
      this.inlineOriginalDir.set(element, element.getAttribute('dir'));
      this.inlineOriginalUnicodeBidi.set(element, element.style.unicodeBidi || null);
      this.inlineOriginalTextAlign.set(element, element.style.textAlign || null);
    }

    this.refreshInlineDirection(element);
  }

  private refreshInlineDirection(element: HTMLElement): void {
    element.setAttribute('dir', 'auto');
    element.style.unicodeBidi = 'plaintext';
    element.style.textAlign = 'start';
  }

  private restoreInlineDirection(element: HTMLElement): void {
    const originalDir = this.inlineOriginalDir.get(element);
    if (originalDir === null || originalDir === undefined) {
      element.removeAttribute('dir');
    } else {
      element.setAttribute('dir', originalDir);
    }

    const originalUnicodeBidi = this.inlineOriginalUnicodeBidi.get(element);
    if (originalUnicodeBidi === null || originalUnicodeBidi === undefined) {
      element.style.removeProperty('unicode-bidi');
    } else {
      element.style.unicodeBidi = originalUnicodeBidi;
    }

    const originalTextAlign = this.inlineOriginalTextAlign.get(element);
    if (originalTextAlign === null || originalTextAlign === undefined) {
      element.style.removeProperty('text-align');
    } else {
      element.style.textAlign = originalTextAlign;
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

    return (element.textContent ?? '').replace(/\u00A0/g, ' ').trim();
  }

  private normalizePlainTextValue(value: string): string {
    return String(value ?? '').replace(/<br\s*\/?>/gi, '\n');
  }

  private isEditableNode(node: EditorNodeMeta): boolean {
    if (['product.', 'origin.'].some((prefix) => node.nodeId.startsWith(prefix))) {
      return false;
    }

    return [
      'navbar.',
      'hero.',
      'slice.',
      'marquee.',
      'about.',
      'products.',
      'origins.',
      'whyUs.',
      'insights.',
      'contact.',
      'newsletter.',
      'footer.',
    ].some((prefix) => node.nodeId.startsWith(prefix));
  }

  private isGlobalVisualNode(nodeId: string): boolean {
    return ['navbar.logo', 'hero.fruit.', 'about.tracker.', 'slice.image.'].some(
      (prefix) => nodeId === prefix || nodeId.startsWith(prefix),
    );
  }

  private isSettingNode(nodeId: string): boolean {
    return nodeId === 'navbar.logo';
  }

  private getSettingKey(nodeId: string): string {
    if (nodeId === 'navbar.logo') {
      return 'brand.logo';
    }

    return nodeId;
  }

  private getUploadFolder(nodeId: string): string {
    if (nodeId === 'navbar.logo') {
      return 'branding';
    }

    if (
      ['hero.fruit.', 'about.tracker.', 'slice.image.'].some(
        (prefix) => nodeId === prefix || nodeId.startsWith(prefix),
      )
    ) {
      return 'site';
    }

    return 'general';
  }

  private makeStorageKey(nodeId: string, scope: EditorValueScope): string {
    return `${scope}::${nodeId}`;
  }

  private isAllowedPreviewLocation(): boolean {
    const frameWindow = this.previewFrame?.nativeElement.contentWindow;

    if (!frameWindow) {
      return false;
    }

    const { pathname, search } = frameWindow.location;
    const params = new URLSearchParams(search);

    return pathname === '/' && params.get('editor') === 'true';
  }

  private buildPreviewUrl(locale: EditableLocale): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `/?editor=true&locale=${locale}&v=${Date.now()}`,
    );
  }

  private reloadPreview(): void {
    this.previewUrl.set(this.buildPreviewUrl(this.locale()));
  }

  private syncLocaleFromPreview(locale: EditableLocale): void {
    if (this.locale() === locale) {
      return;
    }

    this.locale.set(locale);
    this.clearSelection(false);

    setTimeout(() => {
      this.scanNodes();
    }, 0);

    this.status.set(
      `Live preview language switched to ${locale.toUpperCase()}. New edits will now target that locale.`,
    );
  }
}
