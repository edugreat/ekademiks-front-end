import { TestBed } from '@angular/core/testing';

import { ChatCacheService } from './chat-cache.service';

describe('ChatCacheService', () => {
  let service: ChatCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
