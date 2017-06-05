import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageShowsComponent } from './page-shows.component';

describe('PageShowsComponent', () => {
  let component: PageShowsComponent;
  let fixture: ComponentFixture<PageShowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageShowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageShowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
