import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ description: 'RFP ID' })
  @IsString()
  @IsNotEmpty()
  rfpId: string;

  @ApiProperty({ description: 'Vendor ID' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ description: 'Raw email content from vendor' })
  @IsString()
  @IsNotEmpty()
  rawContent: string;
}

export class UpdateProposalDto {
  @ApiProperty({ description: 'Pricing', required: false })
  @IsNumber()
  @IsOptional()
  pricing?: number;

  @ApiProperty({ description: 'Delivery time', required: false })
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiProperty({ description: 'Warranty terms', required: false })
  @IsString()
  @IsOptional()
  warranty?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsString()
  @IsOptional()
  paymentTerms?: string;
}
