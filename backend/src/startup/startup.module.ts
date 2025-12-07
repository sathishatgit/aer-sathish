import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StartupService],
})
export class StartupModule {}
