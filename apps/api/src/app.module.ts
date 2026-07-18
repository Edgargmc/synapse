import { Module } from '@nestjs/common';

import { FutureIdentityModule } from './future-identity/future-identity.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, FutureIdentityModule],
})
export class AppModule {}
