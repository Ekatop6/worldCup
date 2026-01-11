import { TestBed } from '@angular/core/testing';

import { PodiumService } from './podiums.service';

describe('PodiumService', () => {
  let service: PodiumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PodiumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
