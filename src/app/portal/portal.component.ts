// Author: Preston Lee

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PatientService } from '../patient.service';
import { Bundle, HumanName, Patient } from 'fhir/r5';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.scss',
})
export class PortalComponent implements OnInit, OnDestroy {
  patient_id: string | null = null;
  patient: Patient | null = null;
  isMenuCollapsed = true;

  patientEverything: Bundle | null = null;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.patientService.clear();
  }

  ngOnInit(): void {
    this.patient_id = this.route.snapshot.paramMap.get('patient_id');

    if (this.patient_id) {
      this.patientService.loadEverything(this.patient_id);
      this.patientService.currentPatientEverything$.subscribe({
        next: d => {
          this.patientEverything = d;
          if (d) {
            console.log('Loaded patient everything.');
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
    }
  }

  // patientGivenName(): string {
  //   let n = '';
  //   if (this.patient?.name?.[0].given?.[0]) {
  //     n = this.patient.name[0].given[0];
  //   }
  //   return n;
  // }

  patientName(): string {
    let name = '(No Name)';
    if (
      (this.patientEverything?.entry?.[0]?.resource as Patient)?.name &&
      (this.patientEverything?.entry?.[0].resource as Patient)?.name?.length
    ) {
      const rawName = (this.patientEverything?.entry?.[0].resource as Patient)
        .name as HumanName[];
      const tmp = [];
      if (rawName[0].given) {
        tmp.push(...rawName[0].given);
      }
      if (rawName[0].family) {
        tmp.push(rawName[0].family);
      }
      name = tmp.join(' ');
    }
    return name;
  }
}
