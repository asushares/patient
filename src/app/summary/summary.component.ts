import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CDSService,
  MedicalInformationType,
  type PreviewList,
} from '../cds.service';
import { ActivatedRoute } from '@angular/router';
import { NgbAccordionModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from '../patient.service';
import { Bundle } from 'fhir/r5';
import rawRequestBody from '../example-request-permit.json';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, NgbNavModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit, OnDestroy {
  patientId: string | null = null;
  patientEverything: Bundle | null = null;
  consents: unknown[] = [];
  previewList: PreviewList | null = null;

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

  activeCategory = 10;

  _tempPreviewList: PreviewList = {
    SUD: [
      {
        display: 'afternill',
        code: '480',
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        resource: {
          resourceType: 'MedicationRequest',
          id: '211378',
          meta: {
            versionId: '1',
            lastUpdated: '2024-06-06T21:17:01.444+00:00',
            source: '#wkdnGAblhbQtFpOM',
          },
          status: 'active',
          intent: 'order',
          medication: {
            concept: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: '480',
                  display: 'alfentanil',
                },
              ],
            },
          },
          subject: {
            reference: 'Patient/cfsb1703736930464',
          },
        },
        rule: {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '480',
          confidence: 0.0,
        },
        consents: [
          {
            id: '211314',
            status: 'active',
            category: [
              {
                coding: [
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/consentscope',
                    code: 'patient-privacy',
                    display: 'Privacy Consent',
                  },
                ],
                text: 'Privacy Consent',
              },
              {
                id: 'd133890a-82cb-436f-95aa-2dfdcbf32b5a',
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '59284-6',
                    display: 'Consent Document',
                  },
                ],
                text: 'LOINC Consent Document',
              },
            ],
            meta: {
              lastUpdated: '2024-06-06T20:24:38.252+00:00',
            },
            controller: [
              {
                reference: 'Organization/210932',
                type: 'Organization',
              },
            ],
            decision: 'deny',
            provision: [
              {
                actor: [
                  {
                    role: {
                      coding: [
                        {
                          system:
                            'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                          code: 'IRCP',
                        },
                      ],
                    },
                    reference: {
                      reference: 'Organization/210932',
                    },
                  },
                ],
                action: [
                  {
                    coding: [
                      {
                        system:
                          'http://terminology.hl7.org/CodeSystem/consentaction',
                        code: 'access',
                      },
                    ],
                  },
                ],
                securityLabel: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'ACSUBSTAB',
                    display: 'ACSUBSTAB',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'SUD',
                    display: 'SUD',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'BH',
                    display: 'BH',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'DEMO',
                    display: 'DEMO',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'DIA',
                    display: 'DIA',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'DIS',
                    display: 'DIS',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'GDIS',
                    display: 'GDIS',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'DISEASE',
                    display: 'DISEASE',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'DRGIS',
                    display: 'DRGIS',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'SEX',
                    display: 'SEX',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'SOCIAL',
                    display: 'SOCIAL',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'VIO',
                    display: 'VIO',
                  },
                ],
                purpose: [
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ActReason',
                    code: 'RESEARCH',
                    display: 'RESEARCH',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                    code: 'HIPAAConsentCD',
                    display: 'HIPAAConsentCD',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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

  constructor(
    private cdsService: CDSService,
    private route: ActivatedRoute,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.parent!.snapshot.paramMap.get('patient_id');

    this.patientService.currentPatientEverything$.subscribe({
      next: d => {
        this.patientEverything = d;
        if (d?.total) {
          this.consents =
            d?.entry?.filter(e => e?.resource?.resourceType === 'Consent') ??
            [];

          const patientId = [{ value: `Patient/${this.patientId}` }];
          const [_patient, ...rest] = d.entry ?? [];
          const context = {
            ...rawRequestBody.context,
            actor: [],
            patientId,
            content: { ...d, entry: rest },
          };
          const body = { ...rawRequestBody, patientId, context, actors: [] };
          console.log('Posting hook with body:', body);
          this.cdsService.postHook({
            body,
            'cds-redaction-enabled': 'false',
          });
          console.log('consents: ', this.consents);
        }
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

    this.cdsService.currentPreviewList.subscribe({
      next: d => {
        this.previewList = d;
        console.log('Loaded previewList', d);
      },
      error: e => {
        console.error('Failed to load preview list!');
        console.error(e);
      },
    });
    // Initialization logic here.
    console.log('SummaryComponent initialized.');
  }

  ngOnDestroy(): void {
    // Cleanup logic here.
    this.cdsService.clear();
    this.patientService.clear();
    console.log('SummaryComponent destroyed.');
  }
}
