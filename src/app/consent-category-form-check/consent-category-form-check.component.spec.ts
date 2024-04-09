import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentCategoryFormCheckComponent } from './consent-category-form-check.component';

describe('ConsentCategoryFormCheckComponent', () => {
  let component: ConsentCategoryFormCheckComponent;
  let fixture: ComponentFixture<ConsentCategoryFormCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentCategoryFormCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsentCategoryFormCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
