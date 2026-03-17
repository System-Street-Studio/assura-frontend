import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestsMainComponent } from './requests-main';


describe('RequestsMainComponent', () => {
  let component: RequestsMainComponent;
  let fixture: ComponentFixture<RequestsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsMainComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
