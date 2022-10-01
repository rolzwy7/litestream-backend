import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from './stream.service';

describe('StreamService', () => {
  let service: StreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamService],
    }).compile();

    service = module.get<StreamService>(StreamService);

    process.env = { SECRET: '3FOHznZKQlSXXosRO0W6lXwpJL1taGx3' };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fresh token should be valid', () => {
    const jwt = service.createAccessToken('test-stream-id', 'test-chapter');
    expect(service.isAccessTokenValid(jwt)).toEqual(true);
  });

  it('jwt token must be decoded correctly', () => {
    const jwt = service.createAccessToken('test-stream-id', 'test-chapter');
    const json = service.decodeAccessToken(jwt);
    expect(json['stream_id']).toEqual('test-stream-id');
    expect(json['chapter_dir']).toEqual('test-chapter');
  });
});
