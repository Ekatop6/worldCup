import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tatamis } from './tatamis';

describe('Tatamis', () => {
  let component: Tatamis;
  let fixture: ComponentFixture<Tatamis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tatamis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tatamis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
