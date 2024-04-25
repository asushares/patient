import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from '../patient.service';
import { Patient } from 'fhir/r5';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule],
  templateUrl: './portal.component.html',
  styleUrl: './portal.component.scss',
})
export class PortalComponent implements OnInit, OnDestroy {
  patient_id: string | null = null;
  patient: Patient | null = null;
  isMenuCollapsed = true;

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
      this.patientService.load(this.patient_id);
      this.patientService.current.subscribe({
        next: d => {
          this.patient = d;
          if (d) {
            console.log('Loaded patient.');
          } else {
            console.log(
              'Patient data null. Either an intentional cache clearance or not loaded yet. No worries.',
            );
          }
        },
        error: e => {
          console.error('Failed to load patient!');
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
    if (this.patient?.name && this.patient.name.length > 0) {
      const tmp = [];
      if (this.patient.name[0].given) {
        tmp.push(...this.patient.name[0].given);
      }
      if (this.patient.name[0].family) {
        tmp.push(this.patient.name[0].family);
      }
      name = tmp.join(' ');
    }
    return name;
  }
}
