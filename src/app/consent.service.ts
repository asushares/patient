import { Injectable } from '@angular/core';
import { Bundle, Consent } from 'fhir/r5';
import { ConsentSearchField } from './consent.search.field';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsentService extends BaseService {
  public static CONSENT_PATH = '/Consent';

  // constructor(protected backendService: BackendService) {
  //   super();
  // }
  public sort: ConsentSearchField = ConsentSearchField.LastUpdated;
  public order: 'asc' | 'desc' = 'asc';
  public pageSize = 10;
  public offset = 0;

  public current: BehaviorSubject<Consent | null> =
    new BehaviorSubject<Consent | null>(null);

  url(): string {
    return this.backendService.url + ConsentService.CONSENT_PATH;
  }

  queryParameters(p_id: string) {
    return (
      `subject=Patient/${p_id}` +
      `&_sort=${this.order == 'asc' ? '' : '-'}${this.sort}` +
      `&_count=${this.pageSize}&_getpagesoffset=${this.offset}`
    );
  }

  index(p_id: string): Observable<Bundle<Consent>> {
    const b = this.http.get<Bundle<Consent>>(
      this.url() + '?' + this.queryParameters(p_id),
      { headers: this.backendService.headers() },
    );
    return b;
  }

  urlFor(id: string) {
    return this.backendService.url + '/Consent/' + id;
  }

  get(id: string) {
    return this.http.get<Consent>(this.urlFor(id), {
      headers: this.backendService.headers(),
    });
  }

  load(id: string) {
    this.http
      .get<Consent>(this.urlFor(id), { headers: this.backendService.headers() })
      .subscribe({
        next: d => {
          this.current.next(d);
        },
        error: e => {
          console.error('Error loading consent.');
          console.error(e);
        },
      });
  }

  clear() {
    this.current.next(null);
  }

  post(consent: Consent) {
    return this.http.post<Consent>(this.url(), JSON.stringify(consent), {
      headers: this.backendService.headers(),
    });
  }

  put(consent: Consent) {
    return this.http.put<Consent>(
      this.urlFor(consent.id!),
      JSON.stringify(consent),
      { headers: this.backendService.headers() },
    );
  }

  delete(consent: Consent) {
    return this.http.delete<Consent>(this.urlFor(consent.id!), {
      headers: this.backendService.headers(),
    });
  }
}
