import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackResponseDialogComponent } from './feedback-response-dialog.component';

describe('FeedbackResponseDialogComponent', () => {
  let component: FeedbackResponseDialogComponent;
  let fixture: ComponentFixture<FeedbackResponseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackResponseDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
