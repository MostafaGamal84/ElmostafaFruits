import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, concatMap, from, of, toArray } from 'rxjs';
import {
  EditableLocale,
  SiteContentService,
} from '../../../core/services/site-content.service';
import { CmsApiService } from '../../../core/services/cms-api.service';
import {
  EditorValueScope,
  EditorValueType,
  VisualEditorService,
} from '../../../core/services/visual-editor.service';
import { LanguageService } from '../../../core/services/language.service';

interface EditableField {
  nodeId: string;
  label: string;
  multiline?: boolean;
  localized?: boolean;
  mode: 'site-content' | 'visual-override';
  translationPath?: string;
  type?: EditorValueType;
}

interface EditableGroup {
  title: string;
  description: string;
  fields: EditableField[];
}

@Component({
  selector: 'app-admin-site-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow">Copy Studio</span>
          <h2>Portfolio Content Management</h2>
          <p>Edit public copy across the hero, story, showcase, trust, and footer sections.</p>
        </div>

        <div class="toolbar">
          <button
            type="button"
            class="ghost"
            (click)="setLocale('en')"
            [class.active]="locale() === 'en'"
          >
            EN
          </button>
          <button
            type="button"
            class="ghost"
            (click)="setLocale('ar')"
            [class.active]="locale() === 'ar'"
          >
            AR
          </button>
          <button type="button" class="primary" (click)="publishChanges()" [disabled]="publishing()">
            {{ publishing() ? 'Publishing...' : 'Publish Live' }}
          </button>
        </div>
      </div>

      <div class="notice">{{ notice() }}</div>

      <div class="group-grid row g-3 align-items-start">
        <article class="group-col" *ngFor="let group of groups" [ngClass]="groupColumnClass(group)">
          <div class="group-card">
            <div class="group-head">
              <h3>{{ group.title }}</h3>
              <p>{{ group.description }}</p>
            </div>

            <div class="field-grid row g-3">
              <label class="field" *ngFor="let field of group.fields" [ngClass]="fieldColumnClass(field)">
                <span>{{ field.label }}</span>
                <textarea
                  *ngIf="field.multiline; else singleLineInput"
                  [ngModel]="readDraftField(field.nodeId)"
                  (ngModelChange)="updateDraftField(field.nodeId, $event)"
                  rows="3"
                ></textarea>
                <ng-template #singleLineInput>
                  <input
                    [ngModel]="readDraftField(field.nodeId)"
                    (ngModelChange)="updateDraftField(field.nodeId, $event)"
                    type="text"
                  />
                </ng-template>
              </label>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 20px;
      }

      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 10px;
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.8rem;
        font-weight: 800;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        color: var(--text-primary);
      }

      .page-head p,
      .group-head p,
      .notice,
      .field span {
        color: var(--text-secondary);
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      button {
        border: none;
        border-radius: 16px;
        padding: 12px 16px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        transition: all 0.25s ease;
      }

      .ghost {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
      }

      .ghost:hover {
        color: var(--text-primary);
        border-color: rgba(245, 124, 0, 0.35);
      }

      .ghost.active {
        background: rgba(245, 124, 0, 0.12);
        border-color: rgba(245, 124, 0, 0.35);
        color: var(--color-primary);
      }

      .primary {
        color: #fff;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      }

      .primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
      }

      .notice {
        min-height: 24px;
      }

      .group-grid {
        margin-inline: -8px;
      }

      .group-col {
        min-width: 0;
        padding-inline: 8px;
      }

      .group-card {
        height: 100%;
        border-radius: 20px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          background 0.4s ease,
          border-color 0.4s ease;
        padding: 18px;
      }

      .group-head {
        margin-bottom: 16px;
      }

      .group-head h3 {
        color: var(--text-primary);
        font-size: 1rem;
        line-height: 1.35;
      }

      .group-head p {
        margin-top: 6px;
        font-size: 0.88rem;
        line-height: 1.55;
      }

      .field-grid {
        margin-inline: -6px;
      }

      .field {
        display: grid;
        gap: 7px;
        min-width: 0;
        margin: 0;
        padding-inline: 6px;
      }

      .field span {
        font-size: 0.78rem;
        font-weight: 600;
      }

      input,
      textarea {
        width: 100%;
        min-height: 46px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-primary);
        padding: 11px 13px;
        font: inherit;
        resize: vertical;
        transition:
          border-color 0.25s ease,
          background 0.4s ease;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: rgba(245, 124, 0, 0.5);
        background: var(--card-bg);
      }

      textarea {
        min-height: 104px;
      }

      @media (max-width: 960px) {
        .page-head {
          display: grid;
          grid-template-columns: 1fr;
        }

        .toolbar {
          width: 100%;
          justify-content: flex-start;
        }
      }

      @media (max-width: 640px) {
        .group-grid {
          margin-inline: 0;
        }

        .group-col {
          padding-inline: 0;
        }

        .group-card {
          padding: 16px;
          border-radius: 18px;
        }

        .toolbar button {
          flex: 1 1 140px;
        }

        .notice {
          font-size: 0.92rem;
          line-height: 1.6;
        }
      }
    `,
  ],
})
export class AdminSiteContentComponent implements OnInit {
  readonly locale = signal<EditableLocale>('en');
  readonly saving = signal(false);
  readonly publishing = signal(false);
  readonly notice = signal(
    'Draft edits save into NewApi CMS and can be published to the live site when ready.',
  );

  readonly groups: EditableGroup[] = [
    {
      title: 'Navigation And Hero',
      description: 'Top navigation labels and first-fold portfolio messaging.',
      fields: [
        { nodeId: 'navbar.about', label: 'About Label', mode: 'site-content' },
        { nodeId: 'navbar.products', label: 'Showcase Label', mode: 'site-content' },
        { nodeId: 'navbar.origins', label: 'Origins Label', mode: 'site-content' },
        { nodeId: 'navbar.contact', label: 'Contact Label', mode: 'site-content' },
        {
          nodeId: 'navbar.catalog',
          label: 'Catalog Link',
          mode: 'site-content',
        },
        {
          nodeId: 'navbar.blog',
          label: 'Blog Link',
          mode: 'site-content',
        },
        {
          nodeId: 'navbar.quote',
          label: 'Quote Link',
          mode: 'site-content',
        },
        {
          nodeId: 'navbar.adminLink',
          label: 'Admin Link',
          mode: 'site-content',
        },
        { nodeId: 'hero.eyebrow', label: 'Hero Eyebrow', mode: 'site-content' },
        { nodeId: 'hero.title', label: 'Hero Title', mode: 'site-content' },
        {
          nodeId: 'hero.subtitle',
          label: 'Hero Subtitle',
          mode: 'site-content',
          multiline: true,
        },
        { nodeId: 'hero.cta', label: 'Hero CTA', mode: 'site-content' },
      ],
    },
    {
      title: 'About Us Section',
      description: 'Company overview copy, main description, and the three highlight chips.',
      fields: [
        {
          nodeId: 'aboutUs.eyebrow',
          label: 'About Us Eyebrow',
          mode: 'visual-override',
          translationPath: 'aboutUs.eyebrow',
        },
        {
          nodeId: 'aboutUs.title',
          label: 'About Us Title',
          mode: 'visual-override',
          translationPath: 'aboutUs.title',
        },
        {
          nodeId: 'aboutUs.lead',
          label: 'About Us Lead',
          mode: 'visual-override',
          translationPath: 'aboutUs.lead',
          multiline: true,
        },
        {
          nodeId: 'aboutUs.body',
          label: 'About Us Body',
          mode: 'visual-override',
          translationPath: 'aboutUs.body',
          multiline: true,
        },
        {
          nodeId: 'aboutUs.point.0',
          label: 'About Us Point 1',
          mode: 'visual-override',
          translationPath: 'aboutUs.points.0',
        },
        {
          nodeId: 'aboutUs.point.1',
          label: 'About Us Point 2',
          mode: 'visual-override',
          translationPath: 'aboutUs.points.1',
        },
        {
          nodeId: 'aboutUs.point.2',
          label: 'About Us Point 3',
          mode: 'visual-override',
          translationPath: 'aboutUs.points.2',
        },
      ],
    },
    {
      title: 'Story Timeline',
      description: 'Narrative copy for the journey section and its three nodes.',
      fields: [
        {
          nodeId: 'about.eyebrow',
          label: 'Story Eyebrow',
          mode: 'visual-override',
          translationPath: 'hero.story',
        },
        {
          nodeId: 'about.title',
          label: 'Story Title',
          mode: 'visual-override',
          translationPath: 'hero.journey',
        },
        {
          nodeId: 'about.subtitle',
          label: 'Story Subtitle',
          mode: 'visual-override',
          translationPath: 'hero.scroll',
        },
        {
          nodeId: 'about.node1.title',
          label: 'Story Node 1 Title',
          mode: 'visual-override',
          translationPath: 'about.nodes.0.title',
        },
        {
          nodeId: 'about.node1.desc',
          label: 'Story Node 1 Description',
          mode: 'visual-override',
          translationPath: 'about.nodes.0.desc',
          multiline: true,
        },
        {
          nodeId: 'about.node2.title',
          label: 'Story Node 2 Title',
          mode: 'visual-override',
          translationPath: 'about.nodes.1.title',
        },
        {
          nodeId: 'about.node2.desc',
          label: 'Story Node 2 Description',
          mode: 'visual-override',
          translationPath: 'about.nodes.1.desc',
          multiline: true,
        },
        {
          nodeId: 'about.node3.title',
          label: 'Story Node 3 Title',
          mode: 'visual-override',
          translationPath: 'about.nodes.2.title',
        },
        {
          nodeId: 'about.node3.desc',
          label: 'Story Node 3 Description',
          mode: 'visual-override',
          translationPath: 'about.nodes.2.desc',
          multiline: true,
        },
      ],
    },
    {
      title: 'Fruit Slice And Marquee',
      description: 'Core reveal copy and marquee labels that sit between the hero and story sections.',
      fields: [
        {
          nodeId: 'slice.title',
          label: 'Slice Title',
          mode: 'visual-override',
          translationPath: 'slice.title',
          multiline: true,
        },
        {
          nodeId: 'slice.subtitle',
          label: 'Slice Subtitle',
          mode: 'visual-override',
          translationPath: 'slice.subtitle',
          multiline: true,
        },
        {
          nodeId: 'marquee.item.0',
          label: 'Marquee Item 1',
          mode: 'visual-override',
          translationPath: 'marquee.0',
        },
        {
          nodeId: 'marquee.item.1',
          label: 'Marquee Item 2',
          mode: 'visual-override',
          translationPath: 'marquee.1',
        },
        {
          nodeId: 'marquee.item.2',
          label: 'Marquee Item 3',
          mode: 'visual-override',
          translationPath: 'marquee.2',
        },
        {
          nodeId: 'marquee.item.3',
          label: 'Marquee Item 4',
          mode: 'visual-override',
          translationPath: 'marquee.3',
        },
        {
          nodeId: 'marquee.item.4',
          label: 'Marquee Item 5',
          mode: 'visual-override',
          translationPath: 'marquee.4',
        },
      ],
    },
    {
      title: 'Section Headlines',
      description: 'Headings, subtitles, and filter copy for the showcase and origins sections.',
      fields: [
        {
          nodeId: 'products.eyebrow',
          label: 'Showcase Eyebrow',
          mode: 'visual-override',
          translationPath: 'products.eyebrow',
        },
        {
          nodeId: 'products.title',
          label: 'Showcase Title',
          mode: 'visual-override',
          translationPath: 'products.title',
        },
        {
          nodeId: 'products.subtitle',
          label: 'Showcase Subtitle',
          mode: 'visual-override',
          translationPath: 'products.subtitle',
          multiline: true,
        },
        {
          nodeId: 'products.allOrigins',
          label: 'Showcase Filter Placeholder',
          mode: 'visual-override',
          translationPath: 'products.allOrigins',
        },
        {
          nodeId: 'products.filterEyebrow',
          label: 'Showcase Filter Eyebrow',
          mode: 'visual-override',
          translationPath: 'products.filterEyebrow',
        },
        {
          nodeId: 'products.allOriginsHint',
          label: 'Showcase Filter Hint',
          mode: 'visual-override',
          translationPath: 'products.allOriginsHint',
        },
        {
          nodeId: 'origins.eyebrow',
          label: 'Origins Eyebrow',
          mode: 'visual-override',
          translationPath: 'origins.eyebrow',
        },
        {
          nodeId: 'origins.title',
          label: 'Origins Title',
          mode: 'visual-override',
          translationPath: 'origins.title',
        },
        {
          nodeId: 'origins.subtitle',
          label: 'Origins Subtitle',
          mode: 'visual-override',
          translationPath: 'origins.subtitle',
          multiline: true,
        },
      ],
    },
    {
      title: 'Trust Section',
      description: 'The Why Us heading block and the three trust pillars shown on the home page.',
      fields: [
        {
          nodeId: 'whyUs.eyebrow',
          label: 'Why Us Eyebrow',
          mode: 'visual-override',
          translationPath: 'whyUs.eyebrow',
        },
        {
          nodeId: 'whyUs.title',
          label: 'Why Us Title',
          mode: 'visual-override',
          translationPath: 'whyUs.title',
        },
        {
          nodeId: 'whyUs.subtitle',
          label: 'Why Us Subtitle',
          mode: 'visual-override',
          translationPath: 'whyUs.subtitle',
          multiline: true,
        },
        {
          nodeId: 'whyUs.pillar1.title',
          label: 'Pillar 1 Title',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.0.title',
        },
        {
          nodeId: 'whyUs.pillar1.desc',
          label: 'Pillar 1 Description',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.0.desc',
          multiline: true,
        },
        {
          nodeId: 'whyUs.pillar2.title',
          label: 'Pillar 2 Title',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.1.title',
        },
        {
          nodeId: 'whyUs.pillar2.desc',
          label: 'Pillar 2 Description',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.1.desc',
          multiline: true,
        },
        {
          nodeId: 'whyUs.pillar3.title',
          label: 'Pillar 3 Title',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.2.title',
        },
        {
          nodeId: 'whyUs.pillar3.desc',
          label: 'Pillar 3 Description',
          mode: 'visual-override',
          translationPath: 'whyUs.pillars.2.desc',
          multiline: true,
        },
      ],
    },
    {
      title: 'Insights Section',
      description: 'Localized headings for the sourcing regions and milestones section.',
      fields: [
        {
          nodeId: 'insights.regionsEyebrow',
          label: 'Regions Eyebrow',
          mode: 'visual-override',
          translationPath: 'insights.regionsEyebrow',
        },
        {
          nodeId: 'insights.regionsTitle',
          label: 'Regions Title',
          mode: 'visual-override',
          translationPath: 'insights.regionsTitle',
        },
        {
          nodeId: 'insights.milestonesEyebrow',
          label: 'Milestones Eyebrow',
          mode: 'visual-override',
          translationPath: 'insights.milestonesEyebrow',
        },
        {
          nodeId: 'insights.milestonesTitle',
          label: 'Milestones Title',
          mode: 'visual-override',
          translationPath: 'insights.milestonesTitle',
        },
      ],
    },
    {
      title: 'Contact And Newsletter',
      description: 'Localized copy for the inquiry form and newsletter card on the home page.',
      fields: [
        {
          nodeId: 'contact.eyebrow',
          label: 'Contact Eyebrow',
          mode: 'visual-override',
          translationPath: 'contact.eyebrow',
        },
        {
          nodeId: 'contact.title',
          label: 'Contact Title',
          mode: 'visual-override',
          translationPath: 'contact.title',
        },
        {
          nodeId: 'contact.nameLabel',
          label: 'Contact Name Label',
          mode: 'visual-override',
          translationPath: 'contact.nameLabel',
        },
        {
          nodeId: 'contact.namePlaceholder',
          label: 'Contact Name Placeholder',
          mode: 'visual-override',
          translationPath: 'contact.namePlaceholder',
        },
        {
          nodeId: 'contact.emailLabel',
          label: 'Contact Email Label',
          mode: 'visual-override',
          translationPath: 'contact.emailLabel',
        },
        {
          nodeId: 'contact.emailPlaceholder',
          label: 'Contact Email Placeholder',
          mode: 'visual-override',
          translationPath: 'contact.emailPlaceholder',
        },
        {
          nodeId: 'contact.emailError',
          label: 'Contact Email Error',
          mode: 'visual-override',
          translationPath: 'contact.emailError',
        },
        {
          nodeId: 'contact.subjectLabel',
          label: 'Contact Subject Label',
          mode: 'visual-override',
          translationPath: 'contact.subjectLabel',
        },
        {
          nodeId: 'contact.subjectPlaceholder',
          label: 'Contact Subject Placeholder',
          mode: 'visual-override',
          translationPath: 'contact.subjectPlaceholder',
        },
        {
          nodeId: 'contact.messageLabel',
          label: 'Contact Message Label',
          mode: 'visual-override',
          translationPath: 'contact.messageLabel',
        },
        {
          nodeId: 'contact.messagePlaceholder',
          label: 'Contact Message Placeholder',
          mode: 'visual-override',
          translationPath: 'contact.messagePlaceholder',
          multiline: true,
        },
        {
          nodeId: 'contact.submitIdle',
          label: 'Contact Button Label',
          mode: 'visual-override',
          translationPath: 'contact.submitIdle',
        },
        {
          nodeId: 'contact.submitLoading',
          label: 'Contact Button Loading',
          mode: 'visual-override',
          translationPath: 'contact.submitLoading',
        },
        {
          nodeId: 'contact.success',
          label: 'Contact Success Message',
          mode: 'visual-override',
          translationPath: 'contact.success',
        },
        {
          nodeId: 'contact.error',
          label: 'Contact Error Message',
          mode: 'visual-override',
          translationPath: 'contact.error',
        },
        {
          nodeId: 'newsletter.eyebrow',
          label: 'Newsletter Eyebrow',
          mode: 'visual-override',
          translationPath: 'newsletter.eyebrow',
        },
        {
          nodeId: 'newsletter.title',
          label: 'Newsletter Title',
          mode: 'visual-override',
          translationPath: 'newsletter.title',
        },
        {
          nodeId: 'newsletter.emailLabel',
          label: 'Newsletter Email Label',
          mode: 'visual-override',
          translationPath: 'newsletter.emailLabel',
        },
        {
          nodeId: 'newsletter.emailPlaceholder',
          label: 'Newsletter Email Placeholder',
          mode: 'visual-override',
          translationPath: 'newsletter.emailPlaceholder',
        },
        {
          nodeId: 'newsletter.submitIdle',
          label: 'Newsletter Button Label',
          mode: 'visual-override',
          translationPath: 'newsletter.submitIdle',
        },
        {
          nodeId: 'newsletter.submitLoading',
          label: 'Newsletter Button Loading',
          mode: 'visual-override',
          translationPath: 'newsletter.submitLoading',
        },
        {
          nodeId: 'newsletter.success',
          label: 'Newsletter Success Message',
          mode: 'visual-override',
          translationPath: 'newsletter.success',
        },
        {
          nodeId: 'newsletter.error',
          label: 'Newsletter Error Message',
          mode: 'visual-override',
          translationPath: 'newsletter.error',
        },
      ],
    },
    {
      title: 'Footer',
      description: 'Brand text, footer labels, legal copy, and contact details displayed at the bottom of the page.',
      fields: [
        { nodeId: 'footer.brandText', label: 'Brand Text', mode: 'site-content' },
        {
          nodeId: 'footer.description',
          label: 'Footer Description',
          mode: 'site-content',
          multiline: true,
        },
        { nodeId: 'footer.address', label: 'Address', mode: 'site-content' },
        { nodeId: 'footer.email', label: 'Email', localized: false, mode: 'site-content' },
        { nodeId: 'footer.phone', label: 'Phone', localized: false, mode: 'site-content' },
        {
          nodeId: 'footer.touch',
          label: 'Touch Prefix',
          mode: 'visual-override',
          translationPath: 'footer.touch',
        },
        {
          nodeId: 'footer.touchColor',
          label: 'Touch Highlight',
          mode: 'visual-override',
          translationPath: 'footer.touchColor',
        },
        {
          nodeId: 'footer.addressLabel',
          label: 'Address Label',
          mode: 'visual-override',
          translationPath: 'footer.addressLabel',
        },
        {
          nodeId: 'footer.emailLabel',
          label: 'Email Label',
          mode: 'visual-override',
          translationPath: 'footer.emailLabel',
        },
        {
          nodeId: 'footer.phoneLabel',
          label: 'Phone Label',
          mode: 'visual-override',
          translationPath: 'footer.phoneLabel',
        },
        {
          nodeId: 'footer.rightsPrefix',
          label: 'Rights Line',
          mode: 'visual-override',
          translationPath: 'footer.rights',
          multiline: true,
        },
        {
          nodeId: 'footer.privacy',
          label: 'Privacy Link',
          mode: 'visual-override',
          translationPath: 'footer.privacy',
        },
        {
          nodeId: 'footer.terms',
          label: 'Terms Link',
          mode: 'visual-override',
          translationPath: 'footer.terms',
        },
      ],
    },
  ];

  readonly draft = signal<Record<string, string>>({});
  readonly originalDraft = signal<Record<string, string>>({});
  private readonly dirtyFields = new Set<string>();

  constructor(
    private readonly content: SiteContentService,
    private readonly cmsApi: CmsApiService,
    private readonly visualEditor: VisualEditorService,
    private readonly language: LanguageService,
  ) {}

  private normalizeLegacyLineBreaks(value: string): string {
    return String(value ?? '').replace(/<br\s*\/?>/gi, '\n');
  }

  ngOnInit(): void {
    this.loadDraft();
  }

  setLocale(locale: EditableLocale): void {
    this.locale.set(locale);
    this.loadDraft();
  }

  saveChanges(): void {
    const requests = this.buildSaveRequests(true);

    if (requests.length === 0) {
      this.notice.set('No copy changes are waiting to save.');
      return;
    }

    this.saving.set(true);
    this.runSaveRequests(requests).subscribe({
      next: () => {
        this.saving.set(false);
        this.markCurrentDraftSaved();
        this.notice.set(
          `Saved ${this.locale().toUpperCase()} draft copy to NewApi CMS. Publish when you're ready to push live.`,
        );
      },
      error: () => {
        this.saving.set(false);
        this.notice.set('Could not save the draft copy right now.');
      },
    });
  }

  publishChanges(): void {
    this.publishing.set(true);
    this.notice.set(`Saving and publishing the current ${this.locale().toUpperCase()} copy...`);

    this.runSaveRequests(this.buildSaveRequests(true)).subscribe({
      next: () => {
        this.markCurrentDraftSaved();
        this.cmsApi.publishContent().subscribe({
          next: () => {
            this.content.refreshContent();
            this.language.refreshRemoteContent();
            this.visualEditor.refreshOverrides();
            this.publishing.set(false);
            this.notice.set(
              `Published the current ${this.locale().toUpperCase()} copy to the live site.`,
            );
          },
          error: () => {
            this.publishing.set(false);
            this.notice.set('Could not publish the live copy right now.');
          },
        });
      },
      error: () => {
        this.publishing.set(false);
        this.notice.set('Could not save the current copy before publishing.');
      },
    });
  }

  private buildSaveRequests(onlyDirty = false): Observable<unknown>[] {
    const currentDraft = this.draft();

    return this.groups.flatMap((group) =>
      group.fields
        .filter((field) => !onlyDirty || this.dirtyFields.has(field.nodeId))
        .map((field) =>
          this.cmsApi.upsertContent({
            nodeId: field.nodeId,
            value: currentDraft[field.nodeId] ?? '',
            type: this.getOverrideType(field),
            scope: this.getOverrideScope(field),
          }),
        ),
    );
  }

  private runSaveRequests(requests: Observable<unknown>[]): Observable<unknown[]> {
    if (requests.length === 0) {
      return of([]);
    }

    return from(requests).pipe(
      concatMap((request) => request),
      toArray(),
    );
  }

  private markCurrentDraftSaved(): void {
    this.originalDraft.set({ ...this.draft() });
    this.dirtyFields.clear();
  }

  private loadDraft(): void {
    this.cmsApi.getContent('draft').subscribe({
      next: (entries) => {
        const draftEntries = new Map(entries.map((entry) => [`${entry.scope}::${entry.nodeId}`, entry]));
        const nextDraft: Record<string, string> = {};

        for (const group of this.groups) {
          for (const field of group.fields) {
            const cmsKey = `${this.getOverrideScope(field)}::${field.nodeId}`;
            const cmsValue = draftEntries.get(cmsKey)?.value;

            if (cmsValue !== undefined) {
              nextDraft[field.nodeId] = this.normalizeLegacyLineBreaks(cmsValue);
              continue;
            }

            if (field.mode === 'site-content') {
              const locale = field.localized === false ? 'en' : this.locale();
              nextDraft[field.nodeId] = this.content.getValue(field.nodeId, locale);
              continue;
            }

            nextDraft[field.nodeId] = this.getVisualOverrideValue(field);
          }
        }

        this.draft.set(nextDraft);
        this.originalDraft.set({ ...nextDraft });
        this.dirtyFields.clear();
      },
      error: () => {
        const nextDraft: Record<string, string> = {};

        for (const group of this.groups) {
          for (const field of group.fields) {
            if (field.mode === 'site-content') {
              const locale = field.localized === false ? 'en' : this.locale();
              nextDraft[field.nodeId] = this.content.getValue(field.nodeId, locale);
              continue;
            }

            nextDraft[field.nodeId] = this.getVisualOverrideValue(field);
          }
        }

        this.draft.set(nextDraft);
        this.originalDraft.set({ ...nextDraft });
        this.dirtyFields.clear();
      },
    });
  }

  updateDraftField(nodeId: string, value: string): void {
    const normalizedValue = this.normalizeLegacyLineBreaks(value);

    this.draft.update((current) => ({
      ...current,
      [nodeId]: normalizedValue,
    }));

    if (normalizedValue === (this.originalDraft()[nodeId] ?? '')) {
      this.dirtyFields.delete(nodeId);
      return;
    }

    this.dirtyFields.add(nodeId);
  }

  readDraftField(nodeId: string): string {
    return this.draft()[nodeId] ?? '';
  }

  groupColumnClass(group: EditableGroup): string {
    if (group.fields.length <= 4) {
      return 'col-12 col-lg-6 col-xxl-4';
    }

    if (group.fields.length <= 9) {
      return 'col-12 col-xl-6';
    }

    return 'col-12 col-xxl-6';
  }

  fieldColumnClass(field: EditableField): string {
    return field.multiline ? 'col-12' : 'col-12 col-md-6';
  }

  private getVisualOverrideValue(field: EditableField): string {
    const overrides = this.visualEditor.overrides();
    const key = `${this.getOverrideScope(field)}::${field.nodeId}`;
    const override = overrides[key];

    if (override) {
      return this.normalizeLegacyLineBreaks(override.value);
    }

    if (field.translationPath) {
      return this.normalizeLegacyLineBreaks(
        this.language.translateFor(this.locale(), field.translationPath),
      );
    }

    return '';
  }

  private getOverrideScope(field: EditableField): EditorValueScope {
    return field.localized === false ? 'global' : this.locale();
  }

  private getOverrideType(field: EditableField): EditorValueType {
    if (field.type) {
      return field.type;
    }

    return field.multiline ? 'textarea' : 'text';
  }
}
