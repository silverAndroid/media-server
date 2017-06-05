import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSeasonsComponent } from './page-seasons.component';

describe('PageSeasonsComponent', () => {
  let component: PageSeasonsComponent;
  let fixture: ComponentFixture<PageSeasonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSeasonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSeasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
