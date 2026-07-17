import { TestBed } from '@angular/core/testing';

import { EsiosReeApiService } from './esios-ree-api.service';

describe('EsiosReeApiService', () => {
  let service: EsiosReeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsiosReeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
