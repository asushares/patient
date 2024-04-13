import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Popover } from 'bootstrap';

@Component({
  selector: 'app-consent-category-form-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent-category-form-check.component.html',
  styleUrl: './consent-category-form-check.component.scss',
})
export class ConsentCategoryFormCheckComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() category!: {
    id: string;
    label: string;
    contentArr: string[];
  };
  @Input() isFirst!: boolean;
  @Input() previewListString!: string;
  @Output() refreshPreviewList = new EventEmitter<[string, boolean]>();

  popoverTitle =
    'The following information will not be shared with the organizations you specify:';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['previewListString']) {
      const popoverIcon = document.querySelector(`#${this.category.id} ~ i`);
      const popover = Popover.getInstance(popoverIcon!);
      popover?.setContent({
        '.popover-header': this.popoverTitle,
        '.popover-body': this.previewListString,
      });
    }
  }

  ngAfterViewInit() {
    // Initialize Bootstrap popover
    const popoverIcon = document.querySelector(`#${this.category.id} ~ i`);
    new Popover(popoverIcon!);
    // Hide all other popovers when one is shown
    popoverIcon?.addEventListener('show.bs.popover', () => {
      const allOtherIcons = document.querySelectorAll(
        `.form-check-input:not(#${this.category.id}) ~ i`,
      );
      allOtherIcons.forEach(icon => {
        const popover = Popover.getInstance(icon);
        popover?.hide();
      });
      const categoryId = this.category.id;
      const checked =
        popoverIcon.closest('div')?.querySelector('input')?.checked ?? false;
      this.refreshPreviewList.emit([categoryId, checked]);
    });
  }

  ngOnDestroy() {
    const popover = document.querySelector('.popover');
    popover?.remove();
  }
}
