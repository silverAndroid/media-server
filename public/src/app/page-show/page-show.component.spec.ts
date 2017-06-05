import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageShowComponent } from './page-show.component';

describe('PageShowComponent', () => {
  let component: PageShowComponent;
  let fixture: ComponentFixture<PageShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
