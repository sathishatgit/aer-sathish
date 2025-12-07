import { Module } from '@nestjs/common';
import { RfpController } from './rfp.controller';
import { RfpService } from './rfp.service';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AiModule, EmailModule],
  controllers: [RfpController],
  providers: [RfpService],
  exports: [RfpService],
})
export class RfpModule {}
