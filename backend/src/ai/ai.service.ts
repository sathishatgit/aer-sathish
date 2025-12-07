import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SarvamAIClient } from 'sarvamai';
import { PrismaService } from '../prisma/prisma.service';
import { PromptType } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private sarvamClient: SarvamAIClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('SARVAM_API_KEY');
    if (!apiKey) {
      this.logger.warn('SARVAM_API_KEY not found. AI features will not work.');
    } else {
      this.sarvamClient = new SarvamAIClient({ apiSubscriptionKey: apiKey });
      this.logger.log('Sarvam AI initialized successfully');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      if (!this.sarvamClient) {
        throw new Error('AI model not initialized. Check SARVAM_API_KEY.');
      }

      const response = await this.sarvamClient.chat.completions({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 5000, // Increased max tokens for complete responses
        temperature: 0.7, // Balanced creativity and consistency
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Sarvam AI');
      }

      return content;
    } catch (error) {
      const errorMessage = error?.message || 'Unknown error';
      this.logger.error(`Error generating AI content: ${errorMessage}`);

      const status = error?.status || error?.statusCode;
      if (status === 429) {
        throw new HttpException(
          'Sarvam API quota exceeded. Please wait or update your plan/configuration.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new InternalServerErrorException(
        'Failed to generate AI content. Please try again later.',
      );
    }
  }

  async parseRFPFromNaturalLanguage(input: string): Promise<any> {
    try {
      const promptTemplate = await this.prisma.aIPrompt.findFirst({
        where: {
          promptType: PromptType.RFP_CREATION,
          isActive: true,
        },
      });

      if (!promptTemplate) {
        throw new Error('RFP creation prompt template not found');
      }

      const prompt = promptTemplate.template.replace('{input}', input);
      const response = await this.generateContent(prompt);

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(`Error parsing RFP: ${error.message}`);
      throw error;
    }
  }

  async parseProposal(emailContent: string, rfpRequirements: any): Promise<any> {
    try {
      const promptTemplate = await this.prisma.aIPrompt.findFirst({
        where: {
          promptType: PromptType.PROPOSAL_PARSING,
          isActive: true,
        },
      });

      if (!promptTemplate) {
        throw new Error('Proposal parsing prompt template not found');
      }

      const prompt = promptTemplate.template
        .replace('{emailContent}', emailContent)
        .replace('{rfpRequirements}', JSON.stringify(rfpRequirements));

      const response = await this.generateContent(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(`Error parsing proposal: ${error.message}`);
      throw error;
    }
  }

  async compareProposals(rfpRequirements: any, proposals: any[]): Promise<any> {
    try {
      const promptTemplate = await this.prisma.aIPrompt.findFirst({
        where: {
          promptType: PromptType.PROPOSAL_COMPARISON,
          isActive: true,
        },
      });

      if (!promptTemplate) {
        throw new Error('Proposal comparison prompt template not found');
      }

      const prompt = promptTemplate.template
        .replace('{rfpRequirements}', JSON.stringify(rfpRequirements))
        .replace('{proposals}', JSON.stringify(proposals));

      const response = await this.generateContent(prompt);
      console.log('AI Response for Proposal Comparison:', response);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(`Error comparing proposals: ${error.message}`);
      throw error;
    }
  }

  async generateRecommendation(
    rfpTitle: string,
    rfpRequirements: any,
    proposalsWithScores: any[],
    budget: number,
  ): Promise<any> {
    try {
      const promptTemplate = await this.prisma.aIPrompt.findFirst({
        where: {
          promptType: PromptType.RECOMMENDATION,
          isActive: true,
        },
      });

      if (!promptTemplate) {
        throw new Error('Recommendation prompt template not found');
      }

      // Format proposals for better AI understanding
      const proposalsSummary = proposalsWithScores.map((p, idx) => 
        `Vendor ${idx + 1}: ${p.vendorName}
- Vendor ID: ${p.vendorId}
- Pricing: $${p.pricing || 'N/A'}
- Delivery Time: ${p.deliveryTime || 'N/A'}
- Warranty: ${p.warranty || 'N/A'}
- Payment Terms: ${p.paymentTerms || 'N/A'}
- AI Score: ${p.aiScore || 'N/A'}/100`
      ).join('\n\n');

      const prompt = promptTemplate.template
        .replace('{rfpTitle}', rfpTitle)
        .replace('{rfpBudget}', `$${budget}`)
        .replace('{comparisonAnalysis}', `Available Vendors and Their Proposals:\n\n${proposalsSummary}\n\nRequirements: ${JSON.stringify(rfpRequirements)}`);

      this.logger.log('Sending recommendation prompt to AI...');
      const response = await this.generateContent(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const recommendation = JSON.parse(jsonMatch[0]);
      
      // Validate that recommended vendor exists in the proposals
      const recommendedExists = proposalsWithScores.some(
        p => p.vendorName === recommendation.recommendedVendorName || 
             p.vendorId === recommendation.recommendedVendorId
      );

      if (!recommendedExists && proposalsWithScores.length > 0) {
        this.logger.warn('AI recommended non-existent vendor, falling back to highest scored vendor');
        const topVendor = proposalsWithScores.reduce((max, p) => 
          (p.aiScore || 0) > (max.aiScore || 0) ? p : max
        );
        recommendation.recommendedVendorId = topVendor.vendorId;
        recommendation.recommendedVendorName = topVendor.vendorName;
      }

      return recommendation;
    } catch (error) {
      this.logger.error(`Error generating recommendation: ${error.message}`);
      throw error;
    }
  }
}
