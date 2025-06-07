import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../patient.service';
import { ConsentService } from '../consent.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsentSearchField } from '../consent.search.field';
import { Bundle, Consent, Patient } from 'fhir/r5';

@Component({
  selector: 'app-consent-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consent-list.component.html',
  styleUrl: './consent-list.component.scss',
})
export class ConsentListComponent implements OnInit {
  public sortTypes = ConsentSearchField;
  public bundle: Bundle<Consent> | null = null;
  public patient: Patient | null = null;

  constructor(
    private patientService: PatientService,
    protected consentService: ConsentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.patientService.currentPatientEverything$.subscribe({
      next: d => {
        this.patient = d?.entry?.[0] ? (d.entry[0].resource as Patient) : null;
        this.reload();
        // if (d) {
        //   // console.log('Loaded patient.');
        // } else {
        //   // console.log('Patient data null. Either an intentional cache clearance or not loaded yet. No worries.');
        // }
      },
      error: _e => {
        // console.error('Failed to load patient!');
        // console.error(e);
      },
    });
  }

  hasPreviousPage() {
    return this.bundle?.link?.some(l => {
      return l.relation == 'prev';
    });
  }

  hasNextPage() {
    return this.bundle?.link?.some(l => {
      return l.relation == 'next';
    });
  }

  currentOffset() {
    return this.consentService.offset;
  }

  pageSize() {
    return this.consentService.pageSize;
  }

  setOffset(offset: number) {
    this.consentService.offset = offset;
    this.reload();
  }

  currentSort() {
    return this.consentService.sort;
  }

  currentOrder() {
    return this.consentService.order;
  }

  sortBy(field: ConsentSearchField) {
    this.consentService.sort = field;
    this.consentService.order =
      this.consentService.order == 'asc' ? 'desc' : 'asc';
    this.reload();
  }

  reload() {
    if (this.patient?.id) {
      this.consentService.index(this.patient.id).subscribe(b => {
        this.bundle = b;
        // FIXME Remove these lines once real data is available on the server
        // this.bundle.entry = [];
        // this.bundle.entry.push({resource: BrowserComponent.CONSENT_1});
        if (this.bundle.entry) {
          this.bundle.entry.forEach(e => {
            // Cache the names of the patients
            if (e.resource?.subject?.reference) {
              const ref = e.resource?.subject?.reference;
              if (ref.match('^Patient/')) {
                const id = ref.substring('Patient/'.length);
                this.patientService.summary(id).subscribe(p => {
                  // this.patientSummaries[ref] = p;
                  // console.log('Patient summary returned: ');
                  console.log(p);
                });
              }
            }
          });
        }
        console.log(this.bundle);
      });
    }
  }

  formatBundle() {
    const json = JSON.stringify(this.bundle, null, '\t');
    console.log(json);
    return json;
  }

  removeConsent(consent: Consent) {
    let index = -1;
    if (this.bundle?.entry) {
      this.bundle?.entry?.forEach((n, i) => {
        if (consent.id == this.bundle!.entry![i].resource?.id) {
          index = i;
        }
      });
      if (index >= 0) {
        this.bundle!.entry!.splice(index, 1);
      }
    }
  }

  delete(consent: Consent) {
    this.consentService.delete(consent).subscribe({
      next: oo => {
        console.log(oo);
        this.removeConsent(consent);
        // this.toastService.showSuccessToast('Consent Deleted', 'The consent has been deleted.');
      },
      error: error => {
        console.log(error);
        console.log(error.error);
        // this.toastService.showErrorToast('Consent Deletion Failed', 'The server refused to delete the consent document.');
      },
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key == 'ArrowLeft') {
      if (this.hasPreviousPage()) {
        this.setOffset(this.currentOffset() - this.pageSize());
      }
    } else if (event.key == 'ArrowRight') {
      if (this.hasNextPage()) {
        this.setOffset(this.currentOffset() + this.pageSize());
      }
    }
  }
}
