import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpHeaders } from '@angular/common/http';
import { NoConsentCard, PatientConsentHookRequest } from '@asushares/core';

console.log(NoConsentCard, PatientConsentHookRequest);

type RequestType =
  | ['get', 'root']
  | ['get', 'discovery']
  | ['post', 'hook']
  | ['get', 'request_schema']
  | ['get', 'response_schema']
  | ['get', 'sensitivity_rules']
  | ['post', 'sensitivity_rules'];

type EndpointType = {
  url: string;
  headers: string[];
};

const cdsEndpoints = new WeakMap<RequestType, EndpointType>([
  [
    ['get', 'root'],
    {
      url: '/',
      headers: ['standard'],
    },
  ],
  [
    ['get', 'discovery'],
    {
      url: '/cds-services',
      headers: ['standard'],
    },
  ],
  [
    ['post', 'hook'],
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
    ['get', 'request_schema'],
    {
      url: '/schemas/patient-consent-consult-hook-request.schema.json',
      headers: ['standard'],
    },
  ],
  [
    ['get', 'response_schema'],
    {
      url: '/schemas/patient-consent-consult-hook-response.schema.json',
      headers: ['standard'],
    },
  ],
  [
    ['get', 'sensitivity_rules'],
    {
      url: '/data/sensitivity-rules.json',
      headers: ['standard'],
    },
  ],
  [
    ['post', 'sensitivity_rules'],
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
  public requestCreator<T extends string>(requestType: RequestType) {
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
    } & Record<T, string>;

    const request = (parameters: ParameterTypes) => {
      let headers = new HttpHeaders();
      if (includeStandard) {
        headers = headers.set('Content-Type', 'application/json');
        headers = headers.set('Accept', 'application/json');
      }
      otherHeaders.forEach(h => {
        headers = headers.set(h, parameters[h]);
      });
      if (requestType[0] === 'get') {
        return this.http.get(url, { headers });
      } else {
        return this.http[requestType[0]](
          url,
          JSON.stringify(parameters?.body ?? {}),
          { headers },
        );
      }
    };

    return request;
  }
}
