import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailPollingService } from './email-polling.service';

@ApiTags('Email')
@Controller('email')
export class EmailPollingController {
  constructor(private readonly emailPollingService: EmailPollingService) {}

  @Post('check-now')
  @ApiOperation({ 
    summary: 'Manually trigger email check',
    description: 'Immediately check for new vendor emails instead of waiting for scheduled cron job'
  })
  @ApiResponse({ status: 200, description: 'Email check completed' })
  async checkNow() {
    await this.emailPollingService.checkNow();
    return { message: 'Email check completed' };
  }
}
