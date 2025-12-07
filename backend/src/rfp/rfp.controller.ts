import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RfpService } from './rfp.service';
import { CreateRFPDto, CreateStructuredRFPDto, SendRFPDto } from './dto/rfp.dto';

@ApiTags('RFPs')
@Controller('rfps')
export class RfpController {
  constructor(private readonly rfpService: RfpService) {}

  @Post('create-from-nl')
  @ApiOperation({
    summary: 'Create RFP from natural language',
    description: 'Uses AI to parse natural language input and create a structured RFP',
  })
  @ApiResponse({ status: 201, description: 'RFP created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createFromNaturalLanguage(@Body() dto: CreateRFPDto) {
    return this.rfpService.createFromNaturalLanguage(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create RFP with structured data' })
  @ApiResponse({ status: 201, description: 'RFP created successfully' })
  async create(@Body() dto: CreateStructuredRFPDto) {
    return this.rfpService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all RFPs' })
  @ApiResponse({ status: 200, description: 'List of all RFPs' })
  async findAll() {
    return this.rfpService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get RFP statistics' })
  @ApiResponse({ status: 200, description: 'RFP statistics' })
  async getStats() {
    return this.rfpService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFP by ID' })
  @ApiParam({ name: 'id', description: 'RFP ID' })
  @ApiResponse({ status: 200, description: 'RFP details' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async findOne(@Param('id') id: string) {
    return this.rfpService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update RFP' })
  @ApiParam({ name: 'id', description: 'RFP ID' })
  @ApiResponse({ status: 200, description: 'RFP updated successfully' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateStructuredRFPDto>) {
    return this.rfpService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete RFP' })
  @ApiParam({ name: 'id', description: 'RFP ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'RFP deleted successfully' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async delete(@Param('id') id: string) {
    return this.rfpService.delete(id);
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Send RFP to vendors',
    description: 'Sends RFP via email to selected vendors',
  })
  @ApiParam({ name: 'id', description: 'RFP ID' })
  @ApiResponse({ status: 200, description: 'RFP sent successfully' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async sendToVendors(@Param('id') id: string, @Body() dto: SendRFPDto) {
    return this.rfpService.sendToVendors(id, dto);
  }
}
