import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-consent-category-form-check',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule],
  templateUrl: './consent-category-form-check.component.html',
  styleUrl: './consent-category-form-check.component.scss',
})
export class ConsentCategoryFormCheckComponent {
  @Input() category!: {
    id: string;
    label: string;
    contentArr: string[];
  };
  @Input() isFirst!: boolean;
  @Input() previewListString!: string;
  @Output() refreshPreviewList = new EventEmitter<[string, boolean]>();
  @ViewChild('form_check_input')
  form_check_input!: ElementRef<HTMLInputElement>;

  popoverTitle =
    'The following information will not be shared with the organizations you specify:';

  previewShown() {
    const categoryId = this.category.id;
    const checked = this.form_check_input.nativeElement.checked;
    this.refreshPreviewList.emit([categoryId, checked]);
  }
}
