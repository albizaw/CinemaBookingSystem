import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogSummaryComponent } from './mat-dialog-summary.component';

describe('MatDialogSummaryComponent', () => {
  let component: MatDialogSummaryComponent;
  let fixture: ComponentFixture<MatDialogSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatDialogSummaryComponent]
    });
    fixture = TestBed.createComponent(MatDialogSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
