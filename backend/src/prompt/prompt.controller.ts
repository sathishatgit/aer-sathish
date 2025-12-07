import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PromptService } from './prompt.service';
import { CreatePromptDto, UpdatePromptDto } from './dto/prompt.dto';

@ApiTags('AI Prompts')
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new AI prompt',
    description: 'Add a new prompt template for AI operations'
  })
  @ApiResponse({ status: 201, description: 'Prompt created successfully' })
  @ApiResponse({ status: 409, description: 'Prompt with this name already exists' })
  async create(@Body() dto: CreatePromptDto) {
    return this.promptService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts or filter by type' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by prompt type' })
  @ApiResponse({ status: 200, description: 'List of prompts' })
  async findAll(@Query('type') type?: string) {
    if (type) {
      return this.promptService.findByType(type);
    }
    return this.promptService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prompt by ID' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiResponse({ status: 200, description: 'Prompt details' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  async findOne(@Param('id') id: string) {
    return this.promptService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update prompt',
    description: 'Update an existing prompt template'
  })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiResponse({ status: 200, description: 'Prompt updated successfully' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  @ApiResponse({ status: 409, description: 'Name already in use' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromptDto) {
    return this.promptService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Prompt deleted successfully' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  async delete(@Param('id') id: string) {
    return this.promptService.delete(id);
  }
}
