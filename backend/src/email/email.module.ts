import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailPollingService } from './email-polling.service';
import { EmailPollingController } from './email-polling.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  providers: [EmailService, EmailPollingService],
  controllers: [EmailController, EmailPollingController],
  exports: [EmailService, EmailPollingService],
})
export class EmailModule {}
