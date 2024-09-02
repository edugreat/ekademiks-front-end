import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notificationGuard } from './notification.guard';

describe('notificationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notificationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
