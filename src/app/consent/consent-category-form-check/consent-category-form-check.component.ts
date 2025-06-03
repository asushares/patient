import {
  Component,
  Input,
  type OnInit,
  type OnChanges,
  type SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-consent-category-form-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consent-category-form-check.component.html',
  styleUrl: './consent-category-form-check.component.scss',
})
export class ConsentCategoryFormCheckComponent implements OnInit, OnChanges {
  @Input() category!: {
    id: string;
    label: string;
  };
  @Input() isFirst!: boolean;
  @Input() infoItems!: { code: string; display: string }[];

  formCheckInput = new FormControl(true);
  popoverTitle: string =
    'The following information will be shared with the organizations you specify:';
  previewContent: string = 'No relevant Information.';

  ngOnInit(): void {
    this.formCheckInput.valueChanges.subscribe(checked => {
      this.popoverTitle = `The following information will ${checked ? 'be' : 'not be'} shared with the organizations you specify:`;
      this.previewContent = this.regeneratePreviewContent(
        this.infoItems,
        checked ?? true,
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['infoItems']) {
      const checked = this.formCheckInput.value ?? true;
      this.previewContent = this.regeneratePreviewContent(
        this.infoItems,
        checked,
      );
    }
  }

  regeneratePreviewContent(
    items: { code: string; display: string }[],
    checked: boolean,
  ): string {
    return items.length > 0
      ? '<ul><li>' +
          items
            .map(info => {
              return checked
                ? `<span>${info.display}</span>`
                : `<span>${info.display}</span>`;
            })
            .join('</li><li>') +
          '</li></ul>'
      : 'No relevant Information.';
  }
}
