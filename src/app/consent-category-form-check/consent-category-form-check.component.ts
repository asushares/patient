import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consent-category-form-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent-category-form-check.component.html',
  styleUrl: './consent-category-form-check.component.scss'
})
export class ConsentCategoryFormCheckComponent {
  @Input() category!: {
    id: string;
    label: string;
  };
  @Input() isFirst!: boolean;
}
