import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ProposalStatus } from '@prisma/client';

class ReceiveEmailDto {
  from: string;
  subject: string;
  body: string;
  rfpId?: string;
}

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  @Post('receive')
  @ApiOperation({ 
    summary: 'Receive vendor proposal email',
    description: 'Webhook endpoint to receive vendor responses via email. Automatically parses the email with AI and creates a proposal.'
  })
  @ApiResponse({ status: 201, description: 'Email received, parsed, and proposal created successfully' })
  async receiveEmail(@Body() dto: ReceiveEmailDto) {
    // Find vendor by email
    const vendor = await this.prisma.vendor.findUnique({
      where: { email: dto.from },
    });

    if (!vendor) {
      throw new BadRequestException(`Vendor with email ${dto.from} not found. Please register the vendor first.`);
    }

    // If rfpId is provided, use it. Otherwise, try to extract from subject or find latest RFP
    let rfpId = dto.rfpId;
    
    if (!rfpId) {
      // Try to extract RFP ID from subject (e.g., "Re: RFP - Office Supplies [ID: xxx]")
      const rfpIdMatch = dto.subject.match(/\[ID:\s*([a-zA-Z0-9-]+)\]/i);
      if (rfpIdMatch) {
        rfpId = rfpIdMatch[1];
      } else {
        // Find the latest RFP sent to this vendor
        const rfpVendor = await this.prisma.rFPVendor.findFirst({
          where: { vendorId: vendor.id, emailSent: true },
          orderBy: { sentAt: 'desc' },
          include: { rfp: true },
        });
        
        if (rfpVendor) {
          rfpId = rfpVendor.rfpId;
        }
      }
    }

    if (!rfpId) {
      throw new BadRequestException('Could not determine which RFP this proposal is for. Please include RFP ID in the subject or body.');
    }

    // Get RFP details
    const rfp = await this.prisma.rFP.findUnique({
      where: { id: rfpId },
    });

    if (!rfp) {
      throw new BadRequestException(`RFP with ID ${rfpId} not found.`);
    }

    // Check if proposal already exists
    const existingProposal = await this.prisma.proposal.findUnique({
      where: {
        rfpId_vendorId: {
          rfpId,
          vendorId: vendor.id,
        },
      },
    });

    if (existingProposal) {
      throw new BadRequestException(`Proposal from ${vendor.name} for this RFP already exists.`);
    }

    // Log the email
    const emailLog = await this.emailService.receiveProposalEmail(
      dto.from,
      dto.subject,
      dto.body,
      rfpId,
    );

    // Parse the email with AI
    const parsedData = await this.aiService.parseProposal(dto.body, rfp.requirements);

    // Create the proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        rfpId,
        vendorId: vendor.id,
        rawContent: dto.body,
        parsedData,
        pricing: parsedData.pricing || null,
        deliveryTime: parsedData.deliveryTime || null,
        warranty: parsedData.warranty || null,
        paymentTerms: parsedData.paymentTerms || null,
        status: ProposalStatus.PARSED,
      },
      include: {
        vendor: true,
        rfp: true,
      },
    });

    // Update email log as processed
    await this.prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { 
        processed: true,
        proposalId: proposal.id,
      },
    });

    return {
      message: 'Email received and proposal created successfully',
      emailLog,
      proposal,
      parsedData,
    };
  }
}
