import { Module } from '@nestjs/common';
import { ImageProcessor } from './processors';

@Module({
  imports: [],
  controllers: [],
  providers: [ImageProcessor],
})
export class JobQueueModule {}
