// Author: Preston Lee

import { Component } from '@angular/core';
import { Consent } from 'fhir/r5';
import { ConsentService } from '../consent.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss'
})
export class ConsentComponent {


  consent_id: string | null = null;
  consent: Consent | null = null;

  constructor(private consentService: ConsentService, private route: ActivatedRoute, private router: Router) {

  }

  ngOnDestroy(): void {
    this.consentService.clear();
  }

  ngOnInit(): void {
    this.consent_id = this.route.snapshot.paramMap.get('consent_id');
    if (this.consent_id) {
      this.consentService.load(this.consent_id)
      this.consentService.current.subscribe({
        next: d => {
          this.consent = d;
          if (d) {
            console.log('Loaded consent.');
          } else {
            console.log('Consent data null. Either an intentional cache clearance or not loaded yet. No worries.');
          }
        }, error: e => {
          console.error('Failed to load consent!');
          console.error(e);
        }
      });
    }
  }


  addPeriod() {
    if (this.consent) {
      const tomorrow = new Date(Date.now() + (24 * 60 * 60 * 1000));
      tomorrow.toDateString()
      const tomorrow_str = tomorrow.getFullYear() + '-' + tomorrow.getMonth() + '-' + tomorrow.getDay();
      this.consent.period = { start: new Date().toISOString().split('T')[0], end: tomorrow.toISOString().split('T')[0] };
    }
  }

  removePeriod() {
    if (this.consent) {
      delete this.consent.period;
    }
  }

}
