import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Popover } from 'bootstrap';

@Component({
  selector: 'app-consent-category-form-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent-category-form-check.component.html',
  styleUrl: './consent-category-form-check.component.scss',
})
export class ConsentCategoryFormCheckComponent implements AfterViewInit {
  @Input() category!: {
    id: string;
    label: string;
    contentArr: string[];
  };
  @Input() isFirst!: boolean;

  ngAfterViewInit() {
    // Initialize Bootstrap popover
    const popoverIcon = document.querySelector(`#${this.category.id} ~ i`);
    new Popover(popoverIcon!);
    // Hide all other popovers when one is shown
    popoverIcon?.addEventListener('show.bs.popover', () => {
      const allOtherIcons = document.querySelectorAll(
        `.form-check-input:not(#${this.category.id}) ~ i`
      );
      allOtherIcons.forEach((icon) => {
        const popover = Popover.getInstance(icon);
        popover?.hide();
      });
    });
  }
}
