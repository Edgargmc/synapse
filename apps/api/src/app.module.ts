import { Module } from '@nestjs/common';

import { FutureIdentityModule } from './future-identity/future-identity.module';
import { GoalModule } from './goal/goal.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, FutureIdentityModule, GoalModule],
})
export class AppModule {}
