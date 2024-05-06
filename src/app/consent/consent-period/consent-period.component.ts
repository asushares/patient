import {
  Component,
  inject,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  type SimpleChanges,
} from '@angular/core';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consent } from 'fhir/r5';

@Component({
  selector: 'app-consent-period',
  standalone: true,
  imports: [FormsModule, JsonPipe, NgbDatepickerModule],
  templateUrl: './consent-period.component.html',
  styleUrl: './consent-period.component.scss',
})
export class ConsentPeriodComponent implements OnChanges {
  @Input() period!: Consent['period'];
  @Input() provision!: Consent['provision'];
  @Input() removePeriod!: () => void;
  @Input() addPeriod!: () => void;
  @ViewChild('dpFromDate')
  dpFromDate!: ElementRef<HTMLInputElement>;
  @ViewChild('dpToDate')
  dpToDate!: ElementRef<HTMLInputElement>;
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['period']) {
      this.fromDate = this.period?.start
        ? NgbDate.from({
            year: Number(this.period.start.split('-')[0]),
            month: Number(this.period.start.split('-')[1]),
            day: Number(this.period.start.split('-')[2]),
          })
        : null;
      this.toDate = this.period?.end
        ? NgbDate.from({
            year: Number(this.period.end.split('-')[0]),
            month: Number(this.period.end.split('-')[1]),
            day: Number(this.period.end.split('-')[2]),
          })
        : null;
    }
  }

  toDate: NgbDate | null = this.period?.end
    ? NgbDate.from({
        year: Number(this.period.end.split('-')[0]),
        month: Number(this.period.end.split('-')[1]),
        day: Number(this.period.end.split('-')[2]),
      })
    : null;

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  updateFromDate() {
    this.period!.start = `${this.fromDate?.year}-${this.fromDate?.month}-${this.fromDate?.day}`;
  }

  updateToDate() {
    this.period!.end = `${this.toDate?.year}-${this.toDate?.month}-${this.toDate?.day}`;
  }
}
