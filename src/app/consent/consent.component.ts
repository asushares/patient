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
import { CDSService, MedicalInformationType } from '../cds.service';
// used to test
import rawRequestBody from './example-request-permit.json';
import { PatientService } from '../patient.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';

type PreviewList = Record<
  MedicalInformationType,
  { code: string; display: string }[]
>;

type CDSHookResponse = {
  extension: {
    content: {
      entry: {
        resource: {
          meta: {
            security: {
              code: MedicalInformationType;
            }[];
          };
        };
      }[];
    };
  };
};

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
  patientId: string | null = null;
  patientEverything: Bundle | null = null;

  consent_id: string | null = null;
  consent: Consent | null = null;

  simple_consent: SimpleConsent = new SimpleConsent(); // FIXME Create from real data instead.

  organizationSearchText = '';
  organizationList: Bundle<Organization> | null = null;
  organizationSelected: BehaviorSubject<Organization[]> = new BehaviorSubject<
    Organization[]
  >([]);
  organizationSearching: boolean = false;

  authorizationName = '';

  // Categories for consent
  previewList: PreviewList = {
    SUD: [],
    MENCAT: [],
    DEMO: [],
    DIA: [],
    DIS: [],
    GDIS: [],
    DISEASE: [],
    DRGIS: [],
    SEX: [],
    SOCIAL: [],
    VIO: [],
  };

  categories: { id: MedicalInformationType; label: string }[] = [
    { id: 'DEMO', label: 'Demographics' },
    { id: 'DIA', label: 'Diagnoses' },
    { id: 'DIS', label: 'Disabilities' },
    { id: 'GDIS', label: 'Genetics' },
    {
      id: 'DISEASE',
      label: 'Infectious Diseases',
    },
    { id: 'DRGIS', label: 'Medications' },
    { id: 'MENCAT', label: 'Mental Health' },
    {
      id: 'SEX',
      label: 'Sexual and Reproductive Health',
    },
    {
      id: 'SOCIAL',
      label: 'Social Determinants of Health',
    },
    {
      id: 'SUD',
      label: 'Substance Use',
    },
    { id: 'VIO', label: 'Violence' },
  ];

  constructor(
    private cdsService: CDSService,
    private consentService: ConsentService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
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
    this.patientId = this.route.parent!.snapshot.paramMap.get('patient_id');
    this.consent_id = this.route.snapshot.paramMap.get('consent_id');

    if (this.consent_id) {
      this.consentService.load(this.consent_id);
    }

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
                this.organizationSelected.next([
                  ...this.organizationSelected.getValue(),
                  o,
                ]);
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

    this.patientService.currentPatientEverything$.subscribe({
      next: d => {
        this.patientEverything = d;
        if (d) {
          console.log('Loaded patient everything.', d);
        } else {
          console.log(
            'Patient everything data null. Either an intentional cache clearance or not loaded yet. No worries.',
          );
        }
      },
      error: e => {
        console.error('Failed to load patient everything!');
        console.error(e);
      },
    });

    combineLatest([
      this.patientService.currentPatientEverything$,
      this.organizationSelected,
    ]).subscribe(([patientEverything, organizationSelected]) => {
      if (patientEverything) {
        if (
          patientEverything?.entry?.length &&
          patientEverything.entry.length >= 1
        ) {
          const actors = organizationSelected.map(({ id }) => ({
            value: `Organization/${id}`,
          }));
          const patientId = [{ value: `Patient/${this.patientId}` }];
          const [_patient, ...rest] = patientEverything.entry;
          // temporarily include entry items of the example
          const entry = [...rawRequestBody.context.content.entry, ...rest];
          const requestBody = { ...rawRequestBody, actors, patientId, entry };
          this.updatePreviewList(requestBody);
        }
      }
    });
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
      this.organizationSelected.next([
        ...this.organizationSelected.getValue(),
        o,
      ]);
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
        for (let i = 0; i < this.organizationSelected.getValue().length; i++) {
          if (org.id == this.organizationSelected.getValue()[i].id) {
            this.organizationSelected.next(
              this.organizationSelected.getValue().splice(i, 1),
            );
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
    this.organizationSelected.getValue().forEach(o => {
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
    this.organizationSelected.getValue().forEach(n => {
      if (n.id == o.id) {
        selected = true;
      }
    });
    return selected;
  }

  updatePreviewList(requestBody: object): void {
    this.cdsService.postHook({
      body: requestBody,
      'cds-redaction-enabled': 'false',
    });

    this.cdsService.current.subscribe({
      next: (_d: unknown) => {
        const d = _d as CDSHookResponse;

        this.previewList = d?.extension.content.entry.reduce(
          (acc, { resource }) => {
            if (resource.meta.security.length === 0) return acc;
            const { code } = resource.meta.security[0];
            const codings = JSONPath({
              path: '$..coding',
              json: resource,
            }).flat();
            return {
              ...acc,
              [code]: [...acc[code], ...codings],
            };
          },
          {
            SUD: [],
            MENCAT: [],
            DEMO: [],
            DIA: [],
            DIS: [],
            GDIS: [],
            DISEASE: [],
            DRGIS: [],
            SEX: [],
            SOCIAL: [],
            VIO: [],
          } as PreviewList,
        );
      },
      error: e => {
        console.error('Error posting hook.');
        console.error(e);
      },
    });
  }
}
