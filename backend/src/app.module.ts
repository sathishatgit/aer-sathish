import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RfpModule } from './rfp/rfp.module';
import { VendorModule } from './vendor/vendor.module';
import { ProposalModule } from './proposal/proposal.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';
import { PromptModule } from './prompt/prompt.module';
import { StartupModule } from './startup/startup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StartupModule,
    RfpModule,
    VendorModule,
    ProposalModule,
    AiModule,
    EmailModule,
    PromptModule,
  ],
})
export class AppModule {}
