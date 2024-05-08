// Author: Preston Lee

import { Injectable } from '@angular/core';
import { Bundle, Patient } from 'fhir/r5';
import { BaseService } from './base.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientService extends BaseService {
  public static PATIENT_PATH = '/Patient';

  public current: BehaviorSubject<Patient | null> =
    new BehaviorSubject<Patient | null>(null);

  private currentPatientEverything: BehaviorSubject<Bundle | null> =
    new BehaviorSubject<Bundle | null>(null);

  currentPatientEverything$ = this.currentPatientEverything.asObservable();

  url(): string {
    return this.backendService.url + PatientService.PATIENT_PATH;
  }

  index() {
    const b = this.http.get<Bundle<Patient>>(this.url(), {
      headers: this.backendService.headers(),
    });
    return b;
  }

  urlFor(id: string) {
    return this.backendService.url + '/Patient/' + id;
  }

  get(id: string) {
    return this.http.get<Patient>(this.urlFor(id), {
      headers: this.backendService.headers(),
    });
  }

  getEverything(id: string) {
    return this.http.get<Bundle>(this.urlFor(id) + '/$everything', {
      headers: this.backendService.headers(),
    });
  }

  load(id: string) {
    this.http
      .get<Patient>(this.urlFor(id), { headers: this.backendService.headers() })
      .subscribe({
        next: d => {
          this.current.next(d);
        },
        error: e => {
          console.error('Error loading patient.');
          console.error(e);
        },
      });
  }

  loadEverything(id: string) {
    this.http
      .get<Bundle>(this.urlFor(id) + '/$everything', {
        headers: this.backendService.headers(),
      })
      .subscribe({
        next: d => {
          this.currentPatientEverything.next(d);
        },
        error: e => {
          console.error('Error loading patient everything.');
          console.error(e);
        },
      });
  }

  clear() {
    this.current.next(null);
  }

  post(patient: Patient) {
    return this.http.post<Patient>(this.url(), JSON.stringify(patient), {
      headers: this.backendService.headers(),
    });
  }

  put(patient: Patient) {
    return this.http.put<Patient>(
      this.urlFor(patient.id!),
      JSON.stringify(patient),
      { headers: this.backendService.headers() },
    );
  }

  delete(patient: Patient) {
    return this.http.delete<Patient>(this.urlFor(patient.id!), {
      headers: this.backendService.headers(),
    });
  }

  search(text: string) {
    return this.http.get<Bundle<Patient>>(
      this.url() + '?name:contains=' + text,
    );
  }

  summary(id: string) {
    return this.http.get<Patient>(this.urlFor(id) + '?_summary=true');
  }
}
