// Author: Preston Lee

import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { Bundle, Consent, Organization } from 'fhir/r5';
import { ConsentService } from '../consent.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimpleConsent } from './simple_consent';
import { OrganizationService } from '../organization.service';
import { ConsentCategoryFormCheckComponent } from './consent-category-form-check/consent-category-form-check.component';
import { ConsentPeriodComponent } from './consent-period/consent-period.component';
import { CDSService } from '../cds.service';
// used to test
import requestBody from './example-request-permit.json';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConsentCategoryFormCheckComponent,
    ConsentPeriodComponent,
  ],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss',
})
/**
 * Represents the Consent Component.
 */
export class ConsentComponent implements OnInit, OnDestroy {
  consent_id: string | null = null;
  consent: Consent | null = null;

  simple_consent: SimpleConsent = new SimpleConsent(); // FIXME Create from real data instead.

  organizationSearchText = '';
  organizationList: Bundle<Organization> | null = null;
  organizationSelected: Organization[] = [];
  organizationSearching: boolean = false;

  authorizationName = '';

  // Categories for consent
  previewList: [string, boolean][] = [];
  categories = [
    { id: 'categoryDemographics', label: 'Demographics', contentArr: [] },
    { id: 'categoryDiagnoses', label: 'Diagnoses', contentArr: [] },
    { id: 'categoryDisabilities', label: 'Disabilities', contentArr: [] },
    { id: 'categoryGenetics', label: 'Genetics', contentArr: [] },
    {
      id: 'categoryInfectiousDiseases',
      label: 'Infectious Diseases',
      contentArr: [],
    },
    { id: 'categoryMedications', label: 'Medications', contentArr: [] },
    { id: 'categoryMentalHealth', label: 'Mental Health', contentArr: [] },
    {
      id: 'categorySexualAndReproductiveHealth',
      label: 'Sexual and Reproductive Health',
      contentArr: [],
    },
    {
      id: 'categorySocialDeterminantsOfHealth',
      label: 'Social Determinants of Health',
      contentArr: [],
    },
    {
      id: 'categorySubstanceUse',
      label: 'Substance Use',
      contentArr: [
        'Methamphetamine intoxication',
        'Family history-Alcohol abuse',
        'Family history-Drug abuse',
        'Methadone [Presence] in Urine by Screen method',
        'Morphine, lo other',
        'Oplates screen, urine(positive)',
        'Alcohol screening (negative)',
        'History of domestic altercation',
        'Hydrocodone bitartrate 5 mg and paracetamol 325 mg oral tablet',
        'Estazolam 1 mg oral tablet',
      ],
    },
    { id: 'categoryViolence', label: 'Violence', contentArr: [] },
  ];

  get previewListString() {
    return this.previewList.length > 0
      ? '<ul><li>' +
          this.previewList
            .map(([id, permit]) => {
              // const content = this.category.contentArr.find(
              //   content => content.split(' ')[0] === id,
              // );
              return permit
                ? `<span class="text-success">${id}</span>`
                : `<span class="text-danger text-decoration-line-through">${id}</span>`;
            })
            .join('</li><li>') +
          '</li></ul>'
      : '';
  }

  constructor(
    private cdsService: CDSService,
    private consentService: ConsentService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  /**
   * Lifecycle hook that is called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.consentService.clear();
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   */
  ngOnInit(): void {
    this.consent_id = this.route.snapshot.paramMap.get('consent_id');
    if (this.consent_id) {
      this.consentService.load(this.consent_id);
      this.consentService.current.subscribe({
        next: d => {
          this.consent = d;
          if (d) {
            console.log('Loaded consent.');
          } else {
            console.log(
              'Consent data null. Either an intentional cache clearance or not loaded yet. No worries.',
            );
          }
          this.consent?.controller?.forEach(c => {
            // console.log("REF: " + c.reference);
            console.log(c.reference?.match(/Organization\/.+/));

            if (c.reference?.match(/Organization\/.+/) != null) {
              const id = c.reference.substring('Organization/'.length);
              // console.log("CID: " + id);
              this.organizationService.get(id).subscribe({
                next: o => {
                  this.organizationSelected.push(o);
                },
              });
            }
          });
        },
        error: e => {
          console.error('Failed to load consent!');
          console.error(e);
        },
      });
    }
  }

  /**
   * Adds a period to the consent.
   */
  addPeriod() {
    console.log('Adding period.', this, this.consent);
    if (this.consent) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.toDateString();
      const _tomorrow_str =
        tomorrow.getFullYear() +
        '-' +
        tomorrow.getMonth() +
        '-' +
        tomorrow.getDay();
      this.consent.period = {
        start: new Date().toISOString().split('T')[0],
        end: tomorrow.toISOString().split('T')[0],
      };
    }
  }

  /**
   * Removes the period from the consent.
   */
  removePeriod() {
    console.log('Removing period.');
    if (this.consent) {
      delete this.consent.period;
    }
  }

  /**
   * Performs a search for organizations based on the provided text.
   * @param text The search text.
   */
  organizationSearch(_text: string) {
    this.organizationSearching = true;
    this.organizationService
      .search(this.organizationSearchText)
      .subscribe(b => {
        this.organizationList = b;
        this.organizationSearching = false;
      });
  }

  /**
   * Selects an organization and adds it to the consent.
   * @param o The organization to select.
   */
  selectOrganization(o: Organization) {
    if (this.consent) {
      this.organizationSelected.push(o);
      this.consent.controller?.push({
        type: 'Organization',
        reference: 'Organization/' + o.id,
      });
    }
  }

  /**
   * Removes an organization from the consent.
   * @param org The organization to remove.
   */
  removeOrganization(org: Organization) {
    if (this.consent) {
      if (this.consent.controller !== undefined) {
        for (let i = 0; i < this.consent.controller.length; i++) {
          if (
            'Organization/' + org.id ==
            this.consent.controller[i].reference
          ) {
            this.consent.controller.splice(i, 1);
          }
        }
        for (let i = 0; i < this.organizationSelected.length; i++) {
          if (org.id == this.organizationSelected[i].id) {
            this.organizationSelected.splice(i, 1);
          }
        }
      }
    }
  }

  /**
   * Retrieves the organization for the given reference.
   * @param ref The reference string.
   * @returns The organization or null if not found.
   */
  organizationForReference(ref: string): Organization | null {
    let org = null;
    this.organizationSelected.forEach(o => {
      // console.log("REF: " + ref);
      if ('Organization/' + o.id == ref) {
        org = o;
      }
    });
    return org;
  }

  /**
   * Checks if the given organization is selected.
   * @param o The organization to check.
   * @returns True if the organization is selected, false otherwise.
   */
  isSelectedOrganization(o: Organization): boolean {
    let selected = false;
    this.organizationSelected.forEach(n => {
      if (n.id == o.id) {
        selected = true;
      }
    });
    return selected;
  }

  updatePreviewList([category, _checked]: [string, boolean]): void {
    this.cdsService.postHook({
      body: requestBody, // temporarily use an example json to do the test
      'cds-redaction-enabled': 'false',
    });

    this.cdsService.current.subscribe({
      next: _d => {
        this.previewList = [
          [`${category} Test Permit Label ${Date().toLocaleUpperCase()}`, true],
          [`${category} Test Deny Label ${Date().toLocaleUpperCase()}`, false],
        ];
      },
      error: e => {
        console.error('Error posting hook.');
        console.error(e);
      },
    });
  }
}
