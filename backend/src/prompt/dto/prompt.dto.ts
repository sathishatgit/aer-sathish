import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PromptType } from '@prisma/client';

export class CreatePromptDto {
  @ApiProperty({ description: 'Prompt name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Prompt description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Type of prompt',
    enum: PromptType
  })
  @IsEnum(PromptType)
  @IsNotEmpty()
  promptType: PromptType;

  @ApiProperty({ description: 'Prompt template text' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiProperty({ description: 'Whether prompt is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePromptDto {
  @ApiProperty({ description: 'Prompt name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Prompt description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Prompt template text', required: false })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({ description: 'Whether prompt is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
