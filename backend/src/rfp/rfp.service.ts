import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { CreateRFPDto, CreateStructuredRFPDto, SendRFPDto } from './dto/rfp.dto';
import { RFPStatus } from '@prisma/client';

@Injectable()
export class RfpService {
  private readonly logger = new Logger(RfpService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private emailService: EmailService,
  ) {}

  async createFromNaturalLanguage(dto: CreateRFPDto) {
    try {
      this.logger.log('Parsing natural language input with AI...');
      const parsedData = await this.aiService.parseRFPFromNaturalLanguage(
        dto.naturalLanguageInput,
      );

      const rfp = await this.prisma.rFP.create({
        data: {
          title: parsedData.title,
          description: parsedData.description,
          budget: parsedData.budget,
          deadline: parsedData.deadline ? new Date(parsedData.deadline) : null,
          requirements: parsedData.requirements,
          status: RFPStatus.DRAFT,
        },
      });

      this.logger.log(`RFP created: ${rfp.id}`);
      return rfp;
    } catch (error) {
      this.logger.error(`Error creating RFP: ${error.message}`);
      throw error;
    }
  }

  async create(dto: CreateStructuredRFPDto) {
    const rfp = await this.prisma.rFP.create({
      data: {
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        requirements: dto.requirements || {},
        status: RFPStatus.DRAFT,
      },
    });

    return rfp;
  }

  async findAll() {
    return this.prisma.rFP.findMany({
      include: {
        rfpVendors: {
          include: {
            vendor: true,
          },
        },
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const rfp = await this.prisma.rFP.findUnique({
      where: { id },
      include: {
        rfpVendors: {
          include: {
            vendor: true,
          },
        },
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP with ID ${id} not found`);
    }

    return rfp;
  }

  async update(id: string, dto: Partial<CreateStructuredRFPDto>) {
    const rfp = await this.prisma.rFP.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        requirements: dto.requirements,
      },
    });

    return rfp;
  }

  async delete(id: string) {
    await this.prisma.rFP.delete({
      where: { id },
    });

    return { message: 'RFP deleted successfully' };
  }

  async sendToVendors(id: string, dto: SendRFPDto) {
    const rfp = await this.findOne(id);

    const results = [];

    for (const vendorId of dto.vendorIds) {
      try {
        const vendor = await this.prisma.vendor.findUnique({
          where: { id: vendorId },
        });

        if (!vendor) {
          results.push({
            vendorId,
            success: false,
            error: 'Vendor not found',
          });
          continue;
        }

        // Create RFPVendor relationship
        await this.prisma.rFPVendor.upsert({
          where: {
            rfpId_vendorId: {
              rfpId: id,
              vendorId,
            },
          },
          create: {
            rfpId: id,
            vendorId,
            emailSent: true,
            sentAt: new Date(),
          },
          update: {
            emailSent: true,
            sentAt: new Date(),
          },
        });

        // Send email with RFP ID in subject for easy tracking
        await this.emailService.sendRFPEmail(
          vendor.email,
          `RFP: ${rfp.title} [ID: ${id}]`,
          rfp,
          id,
        );

        results.push({
          vendorId,
          vendorName: vendor.name,
          success: true,
        });
      } catch (error) {
        results.push({
          vendorId,
          success: false,
          error: error.message,
        });
      }
    }

    // Update RFP status
    await this.prisma.rFP.update({
      where: { id },
      data: { status: RFPStatus.SENT },
    });

    return {
      message: 'RFP sent to vendors',
      results,
    };
  }

  async getStats() {
    const total = await this.prisma.rFP.count();
    const draft = await this.prisma.rFP.count({ where: { status: RFPStatus.DRAFT } });
    const sent = await this.prisma.rFP.count({ where: { status: RFPStatus.SENT } });
    const completed = await this.prisma.rFP.count({ where: { status: RFPStatus.COMPLETED } });

    return {
      total,
      draft,
      sent,
      completed,
    };
  }
}
