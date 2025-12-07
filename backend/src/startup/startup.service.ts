import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StartupService implements OnModuleInit {
  private readonly logger = new Logger(StartupService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      this.logger.log('Checking database seed status...');

      // Check if vendors already exist
      const vendorCount = await this.prisma.vendor.count();
      
      if (vendorCount === 0) {
        this.logger.log('Seeding vendors...');
        await this.seedVendors();
      } else {
        this.logger.log(`Vendors already exist (${vendorCount} found). Skipping vendor seed.`);
      }

      // Check if AI prompts already exist
      const promptCount = await this.prisma.aIPrompt.count();
      
      if (promptCount === 0) {
        this.logger.log('Seeding AI prompts...');
        await this.seedAIPrompts();
      } else {
        this.logger.log(`AI prompts already exist (${promptCount} found). Skipping prompt seed.`);
      }

      this.logger.log('Database seed check completed successfully.');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
      // Don't throw error to prevent app from crashing
    }
  }

  private async seedVendors() {
    const vendors = [
      {
        name: 'TechSupply Pro',
        email: 'contact@techsupplypro.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, Silicon Valley, CA 94025',
        contactPerson: 'John Smith',
      },
      {
        name: 'Global Electronics',
        email: 'sales@globalelectronics.com',
        phone: '+1-555-0202',
        address: '456 Innovation Ave, Austin, TX 78701',
        contactPerson: 'Sarah Johnson',
      },
      {
        name: 'Office Solutions Inc',
        email: 'info@officesolutions.com',
        phone: '+1-555-0303',
        address: '789 Business Blvd, New York, NY 10001',
        contactPerson: 'Michael Chen',
      },
    ];

    for (const vendor of vendors) {
      await this.prisma.vendor.create({
        data: vendor,
      });
    }

    this.logger.log(`Successfully seeded ${vendors.length} vendors.`);
  }

  private async seedAIPrompts() {
    const prompts: Array<{
      name: string;
      description: string;
      promptType: 'RFP_CREATION' | 'PROPOSAL_PARSING' | 'PROPOSAL_COMPARISON' | 'RECOMMENDATION';
      template: string;
      isActive: boolean;
    }> = [
      {
        name: 'RFP Creation from Natural Language',
        description: 'Converts natural language RFP descriptions into structured format',
        promptType: 'RFP_CREATION' as const,
        template: `You are an expert procurement assistant. Extract structured RFP information from the following natural language description.

Description: {description}

Extract and return a JSON object with the following fields:
- title: A clear, concise title for the RFP
- description: A detailed description
- budget: Estimated budget as a number (extract from text if mentioned)
- deadline: Deadline date in ISO format if mentioned
- requirements: An object containing detailed requirements, including:
  * quantity: Number of items needed
  * specifications: Technical specifications
  * deliveryLocation: Where items should be delivered
  * additionalRequirements: Any other important requirements

Return ONLY the JSON object, no additional text.`,
        isActive: true,
      },
      {
        name: 'Proposal Parsing',
        description: 'Parses vendor email responses into structured proposal data',
        promptType: 'PROPOSAL_PARSING',
        template: `You are an expert procurement assistant. Parse the following vendor proposal email and extract structured information.

Email Content:
{emailContent}

RFP Context:
Title: {rfpTitle}
Description: {rfpDescription}
Requirements: {rfpRequirements}

Extract and return a JSON object with:
- pricing: Total price as a number
- deliveryTime: Delivery timeframe
- warranty: Warranty information
- paymentTerms: Payment terms offered
- specifications: Technical specifications offered
- additionalNotes: Any additional important information

Return ONLY the JSON object, no additional text.`,
        isActive: true,
      },
      {
        name: 'Proposal Comparison',
        description: 'Compares multiple proposals and generates insights',
        promptType: 'PROPOSAL_COMPARISON',
        template: `You are an expert procurement analyst. Compare the following proposals for an RFP and provide detailed analysis.

RFP Details:
Title: {rfpTitle}
Description: {rfpDescription}
Requirements: {rfpRequirements}
Budget: {rfpBudget}

Proposals:
{proposals}

Provide a comprehensive comparison analyzing:
1. Pricing comparison and value for money
2. Delivery timeframes
3. Technical specifications match with requirements
4. Warranty and support offerings
5. Payment terms
6. Overall strengths and weaknesses of each proposal

For each proposal, assign a score from 0-100 based on:
- Price competitiveness (30%)
- Requirement fulfillment (40%)
- Delivery time (15%)
- Warranty & support (15%)

Return a JSON object with:
{
  "analysis": "Detailed comparison text",
  "scores": [
    {"vendorId": "id1", "vendorName": "name1", "score": 85, "strengths": ["..."], "weaknesses": ["..."]},
    ...
  ]
}`,
        isActive: true,
      },
      {
        name: 'Winner Recommendation',
        description: 'Generates recommendation for selecting the best proposal',
        promptType: 'RECOMMENDATION',
        template: `You are an expert procurement advisor. Based on the proposal comparison, provide a clear recommendation for vendor selection.

RFP Details:
Title: {rfpTitle}
Budget: {rfpBudget}

Comparison Analysis:
{comparisonAnalysis}

Provide a professional recommendation that includes:
1. Recommended vendor and clear justification
2. Key reasons for the recommendation
3. Risk assessment and mitigation strategies
4. Alternative options if the recommended vendor is not available
5. Next steps for procurement

Return a JSON object with:
{
  "recommendedVendorId": "vendor_id",
  "recommendedVendorName": "vendor_name",
  "justification": "Detailed explanation",
  "keyStrengths": ["strength1", "strength2", ...],
  "risks": ["risk1", "risk2", ...],
  "mitigationStrategies": ["strategy1", "strategy2", ...],
  "alternativeVendor": "Alternative vendor name and brief reason",
  "nextSteps": ["step1", "step2", ...]
}`,
        isActive: true,
      },
    ];

    for (const prompt of prompts) {
      await this.prisma.aIPrompt.create({
        data: prompt,
      });
    }

    this.logger.log(`Successfully seeded ${prompts.length} AI prompts.`);
  }
}
