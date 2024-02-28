// Author: Preston Lee

import { Component } from '@angular/core';
import { Bundle, Consent, Organization } from 'fhir/r5';
import { ConsentService } from '../consent.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimpleConsent } from './simple_consent';
import { OrganizationService } from '../organization.service';

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

  simple_consent: SimpleConsent = new SimpleConsent(); // FIXME Create from real data instead.


  organizationSearchText = '';
  organizationList: Bundle<Organization> | null = null;
  organizationSelected: Organization[] = [];
  organizationSearching: boolean = false;

  authorizationName = '';
  
  constructor(private consentService: ConsentService, private organizationService: OrganizationService, private route: ActivatedRoute, private router: Router) {

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
          this.consent?.controller?.forEach(c => {
            // console.log("REF: " + c.reference);
            console.log(c.reference?.match(/Organization\/.+/));
            
            if (c.reference?.match(/Organization\/.+/) != null) {
              let id = c.reference.substring('Organization/'.length);
              // console.log("CID: " + id);
              this.organizationService.get(id).subscribe({
                next: o => {
                  this.organizationSelected.push(o);
                }
              });
            }
          });
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


  organizationSearch(text: string) {
    this.organizationSearching = true;
    this.organizationService.search(this.organizationSearchText).subscribe(b => {
      this.organizationList = b;
      this.organizationSearching = false;
    });
  }

  selectOrganization(o: Organization) {
    if (this.consent) {
      this.organizationSelected.push(o);
      this.consent.controller?.push({ type: 'Organization', reference: 'Organization/' + o.id });
    }
  }

  removeOrganization(org: Organization) {
    if (this.consent) {
      if (this.consent.controller !== undefined) {
        for (let i = 0; i < this.consent.controller.length; i++) {
          if ('Organization/' + org.id == this.consent.controller[i].reference) {
            this.consent.controller.splice(i, 1);
          }
        }
        for (let i = 0; i < this.organizationSelected.length; i++) {
          if (org.id == this.organizationSelected[i].id) {
            this.organizationSelected.splice(i, 1);
          }
        }
      }
    }
  }

  organizationForReference(ref: string): Organization | null {
    let org = null;
    this.organizationSelected.forEach(o => {
      // console.log("REF: " + ref);      
      if ('Organization/' + o.id == ref) {
        org = o;
      }
    });
    return org;
  }

  isSelectedOrganization(o: Organization): boolean {
    let selected = false;
    this.organizationSelected.forEach(n => {
      if (n.id == o.id) {
        selected = true;
      }
    });
    return selected;
  }


}
