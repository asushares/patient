// Author: Preston Lee

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PatientService } from './patient.service';
import { BackendService } from './backend.service';
import { ConsentService } from './consent.service';
import { OrganizationService } from './organization.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    PatientService,
    ConsentService,
    OrganizationService,
    BackendService,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Patient Portal';
}
