import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEpisodesComponent } from './page-episodes.component';

describe('PageEpisodesComponent', () => {
  let component: PageEpisodesComponent;
  let fixture: ComponentFixture<PageEpisodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageEpisodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEpisodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
