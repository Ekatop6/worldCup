import { TestBed } from '@angular/core/testing';

import { CompetitorService } from './competitors.service';

describe('CompetitorService', () => {
  let service: CompetitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
