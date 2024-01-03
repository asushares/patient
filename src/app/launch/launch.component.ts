// Author: Preston Lee

import { Component } from '@angular/core';
import { Bundle, Patient } from 'fhir/r5';
import { PatientService } from '../patient.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-launch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './launch.component.html',
  styleUrl: './launch.component.scss'
})
export class LaunchComponent {


  public patientSearchText = '';
  patientList: Bundle<Patient> | null = null;
  // patientSelected: Patient | null = null;
  patientSearching: boolean = false;

  constructor(private patientService: PatientService, private router: Router) {
  }

  patientSearch(text: string) {
    this.patientList = null;
    this.patientSearching = true;
    this.patientService.search(this.patientSearchText).subscribe(b => {
      this.patientList = b;
      this.patientSearching = false;
    });
  }
 
  launchPatientPortal(p: Patient) {
    this.router.navigate(['portal', p.id, 'consent-list']);
  }


}
