// Author: Preston Lee

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PatientService } from './patient.service';
import { BackendService } from './backend.service';
import { ConsentService } from './consent.service';
import { OrganizationService } from './organization.service';
import { CDSService } from './cds.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule,
  ],
  providers: [
    CDSService,
    PatientService,
    ConsentService,
    OrganizationService,
    BackendService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Patient Portal';
}
