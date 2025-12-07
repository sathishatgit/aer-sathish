import 'dotenv/config';
import { PrismaClient, PromptType } from '@prisma/client';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const prisma = new PrismaClient({
 datasourceUrl: connectionString,
});

async function main() {
  console.log('Seeding database...');

  // Seed AI Prompts
  const prompts = [
    {
      name: 'RFP Creation from Natural Language',
      description: 'Converts natural language description into structured RFP',
      promptType: PromptType.RFP_CREATION,
      template: `You are an AI assistant helping to create structured RFPs from natural language descriptions.
      
Parse the following procurement request and extract:
1. Title (brief, descriptive)
2. Description (detailed overview)
3. Budget (numerical value)
4. Deadline (date/time period)
5. Requirements (structured list with categories like items, specifications, quantities, delivery terms, payment terms, warranty requirements)

Input: {input}

Return a JSON object with this structure:
{
  "title": "string",
  "description": "string",
  "budget": number,
  "deadline": "ISO date string or time period",
  "requirements": {
    "items": [],
    "specifications": {},
    "quantities": {},
    "deliveryTerms": "string",
    "paymentTerms": "string",
    "warrantyRequirements": "string",
    "additionalNotes": "string"
  }
}`,
      isActive: true,
    },
    {
      name: 'Proposal Parsing',
      description: 'Parses vendor email responses into structured data',
      promptType: PromptType.PROPOSAL_PARSING,
      template: `You are an AI assistant that extracts structured information from vendor proposal emails.

Parse the following vendor response and extract:
1. Total pricing (numerical value)
2. Delivery time
3. Warranty terms
4. Payment terms
5. Item-by-item breakdown if available
6. Any special conditions or notes

Email Content: {emailContent}

Original RFP Requirements: {rfpRequirements}

Return a JSON object with this structure:
{
  "pricing": number,
  "deliveryTime": "string",
  "warranty": "string",
  "paymentTerms": "string",
  "itemBreakdown": [],
  "specialConditions": "string",
  "completeness": "string (description of how complete the response is)"
}`,
      isActive: true,
    },
    {
      name: 'Proposal Comparison',
      description: 'Compares multiple proposals and provides analysis',
      promptType: PromptType.PROPOSAL_COMPARISON,
      template: `You are an AI assistant that compares vendor proposals for an RFP.

RFP Requirements: {rfpRequirements}

Proposals: {proposals}

Compare these proposals based on:
1. Price competitiveness
2. Compliance with requirements
3. Delivery time
4. Warranty terms
5. Payment terms flexibility
6. Overall value for money

Return a JSON object with:
{
  "comparison": {
    "bestPrice": "vendor name",
    "bestDelivery": "vendor name",
    "bestWarranty": "vendor name",
    "mostCompliant": "vendor name"
  },
  "scores": {
    "vendorId": { "overall": score (0-100), "breakdown": {} }
  },
  "summary": "string"
}`,
      isActive: true,
    },
    {
      name: 'Vendor Recommendation',
      description: 'Provides final recommendation on which vendor to choose',
      promptType: PromptType.RECOMMENDATION,
      template: `You are an AI procurement advisor providing vendor selection recommendations.

RFP Requirements: {rfpRequirements}

Proposals with Scores: {proposalsWithScores}

Budget: {budget}

Based on all factors, provide:
1. Primary recommendation (which vendor and why)
2. Alternative options
3. Risk factors to consider
4. Final decision rationale

Return a JSON object:
{
  "recommendedVendor": "vendor name",
  "reasoning": "detailed explanation",
  "alternatives": [],
  "risks": [],
  "confidenceLevel": "HIGH/MEDIUM/LOW"
}`,
      isActive: true,
    },
  ];

  for (const prompt of prompts) {
    await prisma.aIPrompt.upsert({
      where: { name: prompt.name },
      update: prompt,
      create: prompt,
    });
  }

  // Seed sample vendors
  const vendors = [
    {
      name: 'TechSupply Pro',
      email: 'sales@techsupplypro.com',
      phone: '+1-555-0101',
      address: '123 Tech Street, San Francisco, CA 94102',
      contactPerson: 'John Smith',
    },
    {
      name: 'Global Electronics',
      email: 'vendor@globalelectronics.com',
      phone: '+1-555-0102',
      address: '456 Commerce Ave, New York, NY 10001',
      contactPerson: 'Sarah Johnson',
    },
    {
      name: 'Office Solutions Inc',
      email: 'quotes@officesolutions.com',
      phone: '+1-555-0103',
      address: '789 Business Blvd, Austin, TX 78701',
      contactPerson: 'Mike Wilson',
    },
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { email: vendor.email },
      update: vendor,
      create: vendor,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
