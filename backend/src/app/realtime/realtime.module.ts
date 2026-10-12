import { AuthModule } from '@app/auth/auth.module.js';
import { RealtimeGateway } from '@app/realtime/gateways/realtime.gateway.js';
import { SquadEventsListener } from '@app/realtime/listeners/squad-events.listener.js';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, SquadEventsListener],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
