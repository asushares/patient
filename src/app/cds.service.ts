import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NoConsentCard } from '@asushares/core';

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
        this.current.next(d);
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
}
