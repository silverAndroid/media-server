import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMoviesComponent } from './page-movies.component';

describe('PageMoviesComponent', () => {
  let component: PageMoviesComponent;
  let fixture: ComponentFixture<PageMoviesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageMoviesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageMoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
