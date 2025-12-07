import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto';
import { ProposalStatus } from '@prisma/client';

@Injectable()
export class ProposalService {
  private readonly logger = new Logger(ProposalService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async create(dto: CreateProposalDto) {
    try {
      // Get RFP details
      const rfp = await this.prisma.rFP.findUnique({
        where: { id: dto.rfpId },
      });

      if (!rfp) {
        throw new NotFoundException(`RFP with ID ${dto.rfpId} not found`);
      }

      // Parse proposal using AI
      this.logger.log('Parsing proposal with AI...');
      const parsedData = await this.aiService.parseProposal(
        dto.rawContent,
        rfp.requirements,
      );

      // Create proposal
      const proposal = await this.prisma.proposal.create({
        data: {
          rfpId: dto.rfpId,
          vendorId: dto.vendorId,
          rawContent: dto.rawContent,
          parsedData,
          pricing: parsedData.pricing,
          deliveryTime: parsedData.deliveryTime,
          warranty: parsedData.warranty,
          paymentTerms: parsedData.paymentTerms,
          status: ProposalStatus.PARSED,
        },
        include: {
          vendor: true,
          rfp: true,
        },
      });

      this.logger.log(`Proposal created: ${proposal.id}`);
      return proposal;
    } catch (error) {
      this.logger.error(`Error creating proposal: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.proposal.findMany({
      include: {
        vendor: true,
        rfp: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByRfp(rfpId: string) {
    return this.prisma.proposal.findMany({
      where: { rfpId },
      include: {
        vendor: true,
        rfp: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfp: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async update(id: string, dto: UpdateProposalDto) {
    const proposal = await this.prisma.proposal.update({
      where: { id },
      data: dto,
      include: {
        vendor: true,
        rfp: true,
      },
    });

    return proposal;
  }

  async delete(id: string) {
    await this.prisma.proposal.delete({
      where: { id },
    });

    return { message: 'Proposal deleted successfully' };
  }

  async compareProposals(rfpId: string) {
    try {
      const rfp = await this.prisma.rFP.findUnique({
        where: { id: rfpId },
      });

      if (!rfp) {
        throw new NotFoundException(`RFP with ID ${rfpId} not found`);
      }

      const proposals = await this.findByRfp(rfpId);

      if (proposals.length === 0) {
        return {
          message: 'No proposals found for this RFP',
          comparison: null,
        };
      }

      // Prepare proposals data for AI comparison
      const proposalsData = proposals.map((p) => ({
        id: p.id,
        vendorName: p.vendor.name,
        vendorId: p.vendorId,
        pricing: p.pricing,
        deliveryTime: p.deliveryTime,
        warranty: p.warranty,
        paymentTerms: p.paymentTerms,
        parsedData: p.parsedData,
      }));

      // Use AI to compare
      this.logger.log('Comparing proposals with AI...');
      const comparison = await this.aiService.compareProposals(
        rfp.requirements,
        proposalsData,
      );

      // Update proposals with scores
      if (comparison.scores) {
        for (const [vendorId, scoreData] of Object.entries(comparison.scores)) {
          const proposal = proposals.find((p) => p.vendorId === vendorId);
          if (proposal && scoreData && typeof scoreData === 'object') {
            await this.prisma.proposal.update({
              where: { id: proposal.id },
              data: {
                aiScore: (scoreData as any).overall || null,
                status: ProposalStatus.UNDER_REVIEW,
              },
            });
          }
        }
      }

      return {
        rfp,
        proposals: await this.findByRfp(rfpId), // Get updated proposals with scores
        comparison,
      };
    } catch (error) {
      this.logger.error(`Error comparing proposals: ${error.message}`);
      throw error;
    }
  }

  async getRecommendation(rfpId: string) {
    try {
      const comparisonResult = await this.compareProposals(rfpId);

      if (!comparisonResult.comparison) {
        return {
          message: 'No proposals to compare',
          recommendation: null,
        };
      }

      const rfp = comparisonResult.rfp;
      const proposals = comparisonResult.proposals;

      const proposalsWithScores = proposals.map((p) => ({
        id: p.id,
        vendorName: p.vendor.name,
        vendorId: p.vendorId,
        pricing: p.pricing,
        deliveryTime: p.deliveryTime,
        warranty: p.warranty,
        paymentTerms: p.paymentTerms,
        aiScore: p.aiScore,
        parsedData: p.parsedData,
      }));

      this.logger.log('Generating recommendation with AI...');
      const recommendation = await this.aiService.generateRecommendation(
        rfp.title,
        rfp.requirements,
        proposalsWithScores,
        rfp.budget || 0,
      );

      // Update recommended proposal
      if (recommendation.recommendedVendorName || recommendation.recommendedVendorId) {
        const recommendedProposal = proposals.find(
          (p) => p.vendor.name === recommendation.recommendedVendorName ||
                 p.vendorId === recommendation.recommendedVendorId
        );

        if (recommendedProposal) {
          await this.prisma.proposal.update({
            where: { id: recommendedProposal.id },
            data: {
              aiRecommendation: recommendation.justification || recommendation.reasoning,
              status: ProposalStatus.UNDER_REVIEW,
            },
          });
        }
      }

      return {
        rfp,
        proposals: await this.findByRfp(rfpId),
        comparison: comparisonResult.comparison,
        recommendation,
      };
    } catch (error) {
      this.logger.error(`Error generating recommendation: ${error.message}`);
      throw error;
    }
  }
}
