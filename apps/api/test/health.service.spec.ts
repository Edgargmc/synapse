import { Test } from '@nestjs/testing';

import { DatabaseService } from '../src/database/database.service';
import { HealthService } from '../src/health/health.service';

const isoUtcTimestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('HealthService', () => {
  it('returns ok when the database responds', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DatabaseService,
          useValue: {
            ping: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(HealthService);
    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.services.database).toBe('up');
    expect(result.timestamp).toMatch(isoUtcTimestampPattern);
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('returns degraded without leaking internal database details when the check fails', async () => {
    const internalError = new Error(
      'password authentication failed for user "synapse": connect ECONNREFUSED',
    );
    internalError.stack =
      'Error: password authentication failed for user "synapse"\n    at Parser.parseErrorMessage';

    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DatabaseService,
          useValue: {
            ping: jest.fn().mockRejectedValue(internalError),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(HealthService);
    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.services.database).toBe('down');
    expect(result.timestamp).toMatch(isoUtcTimestampPattern);
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('password authentication failed');
    expect(serialized).not.toContain('ECONNREFUSED');
    expect(serialized).not.toContain('Parser.parseErrorMessage');
    expect(serialized).not.toContain('stack');
  });
});
