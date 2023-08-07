import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSeanceComponent } from './add-seance.component';

describe('AddSeanceComponent', () => {
  let component: AddSeanceComponent;
  let fixture: ComponentFixture<AddSeanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSeanceComponent]
    });
    fixture = TestBed.createComponent(AddSeanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
