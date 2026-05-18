import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsPageComponent } from './requests-page';

describe('RequestsPageComponent', () => {
  let component: RequestsPageComponent;
  let fixture: ComponentFixture<RequestsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
