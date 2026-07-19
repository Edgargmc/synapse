import { Module } from '@nestjs/common';

import { CLOCK } from '../../application/ports/clock';
import { ID_GENERATOR } from '../../application/ports/id-generator';
import { RandomUuidGenerator } from './random-uuid-generator';
import { SystemClock } from './system-clock';

@Module({
  providers: [
    {
      provide: CLOCK,
      useFactory: () => new SystemClock(),
    },
    {
      provide: ID_GENERATOR,
      useFactory: () => new RandomUuidGenerator(),
    },
  ],
  exports: [CLOCK, ID_GENERATOR],
})
export class CommonSystemModule {}
