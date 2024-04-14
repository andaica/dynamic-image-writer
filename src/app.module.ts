import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import config from './config';
import { JobQueueModule } from './jobqueue';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: config.REDIS_HOST,
        port: Number(config.REDIS_PORT),
        password: config.REDIS_PASSWORD,
        db: Number(config.REDIS_DB),
      },
    }),
    BullModule.registerQueue({
      name: 'dynamicImageJobQueue',
    }),
    JobQueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
