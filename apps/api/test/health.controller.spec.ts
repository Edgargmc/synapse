import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';

import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';

const isoUtcTimestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('HealthController', () => {
  it('returns a healthy payload with an ISO 8601 UTC timestamp', async () => {
    const check = jest.fn().mockResolvedValue({
      status: 'ok',
      services: {
        database: 'up',
      },
      timestamp: '2026-07-18T19:30:00.000Z',
    });

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: { check },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const response = {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const result = await controller.getHealth(response);

    expect(check).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result.timestamp).toMatch(isoUtcTimestampPattern);
  });

  it('returns HTTP 503 for a degraded payload without leaking internal details', async () => {
    const check = jest.fn().mockResolvedValue({
      status: 'degraded',
      services: {
        database: 'down',
      },
      timestamp: '2026-07-18T19:30:00.000Z',
    });

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: { check },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const response = {
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const result = await controller.getHealth(response);
    const serialized = JSON.stringify(result);

    expect(check).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    expect(result.timestamp).toMatch(isoUtcTimestampPattern);
    expect(serialized).not.toContain('postgresql://');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('stack');
  });
});
