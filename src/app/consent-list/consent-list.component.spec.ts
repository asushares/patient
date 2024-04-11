import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentListComponent } from './consent-list.component';

describe('ConsentListComponent', () => {
  let component: ConsentListComponent;
  let fixture: ComponentFixture<ConsentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
