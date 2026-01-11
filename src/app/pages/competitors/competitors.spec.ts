import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Competitors } from './competitors';

describe('Competitors', () => {
  let component: Competitors;
  let fixture: ComponentFixture<Competitors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Competitors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Competitors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
