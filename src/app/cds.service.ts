import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NoConsentCard } from '@asushares/core';
import { JSONPath } from 'jsonpath-plus';
import { FhirResource } from 'fhir/r5';

type RequestType =
  | 'get-root'
  | 'get-discovery'
  | 'post-hook'
  | 'get-request_schema'
  | 'get-response_schema'
  | 'get-sensitivity_rules'
  | 'post-sensitivity_rules';

type EndpointType = {
  url: string;
  headers: string[];
};

export type MedicalInformationType =
  | 'SUD'
  | 'MENCAT'
  | 'DEMO'
  | 'DIA'
  | 'DIS'
  | 'GDIS'
  | 'DISEASE'
  | 'DRGIS'
  | 'SEX'
  | 'SOCIAL'
  | 'VIO';

export type PreviewList = Record<
  MedicalInformationType,
  {
    code: string;
    display: string;
    system: string;
    resource: unknown;
    rule?: { code: string; system: string; confidence: number };
    consents?: {
      id: string;
      status: string;
      meta: {
        lastUpdated: string;
      };
      category: unknown[];
      controller: unknown[];
      decision: 'deny' | 'permit';
      provision: {
        actor: {
          role: { coding: { code: string; system: string }[] };
          reference: { reference: string };
        }[];
        action: { coding: { code: string; system: string }[] }[];
        purpose: {
          code: string;
          system: string;
          display: string;
        }[];
        securityLabel: unknown[];
      }[];
    }[];
  }[]
>;

export type CDSHookResponse = {
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

const cdsEndpoints = new Map<RequestType, EndpointType>([
  [
    'get-root',
    {
      url: '/',
      headers: ['standard'],
    },
  ],
  [
    'get-discovery',
    {
      url: '/cds-services',
      headers: ['standard'],
    },
  ],
  [
    'post-hook',
    {
      url: '/cds-services/patient-consent-consult',
      headers: [
        'standard',
        'cds-confidence-threshold',
        'cds-redaction-enabled',
      ],
    },
  ],
  [
    'get-request_schema',
    {
      url: '/schemas/patient-consent-consult-hook-request.schema.json',
      headers: ['standard'],
    },
  ],
  [
    'get-response_schema',
    {
      url: '/schemas/patient-consent-consult-hook-response.schema.json',
      headers: ['standard'],
    },
  ],
  [
    'get-sensitivity_rules',
    {
      url: '/data/sensitivity-rules.json',
      headers: ['standard'],
    },
  ],
  [
    'post-sensitivity_rules',
    {
      url: '/data/sensitivity-rules.json',
      headers: ['standard'],
    },
  ],
]);

@Injectable({
  providedIn: 'root',
})
export class CDSService extends BaseService {
  public current = new BehaviorSubject<NoConsentCard | null>(null);

  public currentPreviewList = new BehaviorSubject<PreviewList | null>(null);

  public requestCreator<T extends string, S extends object>(
    requestType: RequestType,
  ) {
    const endpoint = cdsEndpoints.get(requestType);
    if (!endpoint) {
      throw new Error('Invalid request type');
    }
    const url = this.backendService.cdsUrl + endpoint.url;
    const acceptedHeaders = endpoint.headers;
    const includeStandard = acceptedHeaders.includes('standard');
    const otherHeaders = acceptedHeaders.filter(h => h !== 'standard') as T[];

    type ParameterTypes = {
      body?: object;
    } & Partial<Record<T, string>>;

    const request = (parameters: ParameterTypes) => {
      let headers = new HttpHeaders();
      if (includeStandard) {
        headers = headers.set('Content-Type', 'application/json');
        headers = headers.set('Accept', 'application/json');
      }
      otherHeaders.forEach(h => {
        if (typeof parameters[h] === 'string' && parameters[h] !== '') {
          headers = headers.set(h, parameters[h]!);
        }
      });
      if (requestType.split('-')[0] === 'get') {
        return this.http.get<S>(url, { headers });
      } else {
        return this.http.post<S>(url, JSON.stringify(parameters?.body ?? {}), {
          headers,
        });
      }
    };

    return request;
  }

  public getRoot = this.requestCreator('get-root');

  public getDiscovery = this.requestCreator('get-discovery');

  public postHook = (
    parameters: { body: object } & Partial<
      Record<'cds-confidence-threshold' | 'cds-redaction-enabled', string>
    >,
  ) =>
    this.requestCreator<
      'cds-confidence-threshold' | 'cds-redaction-enabled',
      NoConsentCard
    >('post-hook')(parameters).subscribe({
      next: d => {
        console.log('Hook response:', d);
        this.current.next(d);
        this.currentPreviewList.next(
          d?.extension?.content?.entry?.reduce(
            (acc, { resource }) => {
              if (!resource) {
                resource = {} as FhirResource;
              }
              if (!resource.meta) {
                resource.meta = {
                  security: [],
                };
              }
              if (!resource.meta.security) {
                resource.meta.security = [];
              }
              if (resource.meta.security.length === 0) {
                return acc;
              }
              const { code } = resource.meta.security[0] as {
                code: MedicalInformationType;
              };
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
              SUD: [
                // {
                //   display: 'afternill',
                //   code: '480',
                //   system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                //   resource: {
                //     resourceType: 'Medication',
                //     id: 'med0310',
                //     contained: [
                //       {
                //         resourceType: 'Substance',
                //         id: 'sub03',
                //         instance: false,
                //         code: {
                //           concept: {
                //             coding: [
                //               {
                //                 system:
                //                   'http://www.nlm.nih.gov/research/umls/rxnorm',
                //                 code: '480',
                //                 display: 'alfentanil',
                //               },
                //             ],
                //           },
                //         },
                //       },
                //     ],
                //   },
                // },
                {
                  display: 'ALfentanil hydrochloride',
                  code: '211378',
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
                            system:
                              'http://www.nlm.nih.gov/research/umls/rxnorm',
                            code: '211393',
                            display: 'ALfentanil hydrochloride',
                          },
                        ],
                      },
                    },
                    subject: {
                      reference: 'Patient/cfsb1703736930464',
                    },
                  },
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
            } as PreviewList,
          ) ?? null,
        );
      },
      error: e => {
        console.error('Error posting hook.');
        console.error(e);
      },
    });

  public getRequestSchema = this.requestCreator('get-request_schema');

  public getResponseSchema = this.requestCreator('get-response_schema');

  public getSensitivityRules = this.requestCreator('get-sensitivity_rules');

  public postSensitivityRules = this.requestCreator('post-sensitivity_rules');

  public clear() {
    this.current.next(null);
  }

  updatePreviewList(requestBody: object, _previewList: PreviewList): void {
    this.postHook({
      body: requestBody,
      'cds-redaction-enabled': 'false',
    });

    this.current.subscribe({
      next: (_d: unknown) => {
        const d = _d as CDSHookResponse;
        console.log('Preview list response:', d?.extension.content.entry);
        _previewList = d?.extension.content.entry.reduce(
          (acc, { resource }) => {
            if (!resource.meta) {
              resource.meta = {
                security: [],
              };
            }
            if (!resource.meta.security) {
              resource.meta.security = [];
            }
            if (resource.meta.security.length === 0) {
              return acc;
            }
            const { code } = resource.meta.security[0];
            const codings = JSONPath({
              path: '$..coding',
              json: resource,
            }).flat();
            return {
              ...acc,
              [code]: [...acc[code], { ...codings, resource }],
            };
          },
          {
            SUD: [
              {
                display: 'afternill',
                code: '480',
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                resource: {
                  resourceType: 'Medication',
                  id: 'med0310',
                  contained: [
                    {
                      resourceType: 'Substance',
                      id: 'sub03',
                      instance: false,
                      code: {
                        concept: {
                          coding: [
                            {
                              system:
                                'http://www.nlm.nih.gov/research/umls/rxnorm',
                              code: '480',
                              display: 'alfentanil',
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
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
          } as PreviewList,
        );
        console.log('_previewList: ', _previewList);
      },
      error: (e: Error) => {
        console.error('Error posting hook.');
        console.error(e);
      },
    });
  }
}
