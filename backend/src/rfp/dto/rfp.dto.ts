import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRFPDto {
  @ApiProperty({ 
    description: 'Natural language description of procurement needs',
    example: 'I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days.'
  })
  @IsString()
  @IsNotEmpty()
  naturalLanguageInput: string;
}

export class CreateStructuredRFPDto {
  @ApiProperty({ description: 'RFP title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Budget amount', required: false })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiProperty({ description: 'Deadline date', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ description: 'Structured requirements', type: 'object' })
  @IsOptional()
  requirements?: any;
}

export class SendRFPDto {
  @ApiProperty({ 
    description: 'Array of vendor IDs to send RFP to',
    type: [String]
  })
  @IsNotEmpty()
  vendorIds: string[];
}
