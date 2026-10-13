import { ActivityController } from '@app/activity/controllers/activity.controller.js';
import { SquadActivityListener } from '@app/activity/listeners/squad-activity.listener.js';
import { ActivityRepository } from '@app/activity/repositories/activity.repository.js';
import { ActivityEvent, ActivityEventSchema } from '@app/activity/schemas/activity-event.schema.js';
import { ActivityService } from '@app/activity/services/activity.service.js';
import { AuthModule } from '@app/auth/auth.module.js';
import { CharactersModule } from '@app/characters/characters.module.js';
import { SquadsModule } from '@app/squads/squads.module.js';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActivityEvent.name, schema: ActivityEventSchema }]),
    AuthModule,
    SquadsModule,
    CharactersModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository, SquadActivityListener],
})
export class ActivityModule {}
