import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Consent } from 'fhir/r5';

@Component({
  selector: 'app-consent-period',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './consent-period.component.html',
  styleUrl: './consent-period.component.scss',
})
export class ConsentPeriodComponent {
  @Input() period!: Consent['period'];
  @Input() provision!: Consent['provision'];
  @Input() removePeriod!: () => void;
  @Input() addPeriod!: () => void;
}
