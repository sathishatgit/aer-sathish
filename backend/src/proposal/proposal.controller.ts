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
import { ProposalService } from './proposal.service';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto';

@ApiTags('Proposals')
@Controller('proposals')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  @ApiOperation({
    summary: 'Create proposal from vendor response',
    description: 'Creates a proposal and uses AI to parse vendor email content',
  })
  @ApiResponse({ status: 201, description: 'Proposal created and parsed successfully' })
  @ApiResponse({ status: 404, description: 'RFP or Vendor not found' })
  async create(@Body() dto: CreateProposalDto) {
    return this.proposalService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all proposals or filter by RFP' })
  @ApiQuery({ name: 'rfpId', required: false, description: 'Filter by RFP ID' })
  @ApiResponse({ status: 200, description: 'List of proposals' })
  async findAll(@Query('rfpId') rfpId?: string) {
    if (rfpId) {
      return this.proposalService.findByRfp(rfpId);
    }
    return this.proposalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiResponse({ status: 200, description: 'Proposal details' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async findOne(@Param('id') id: string) {
    return this.proposalService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update proposal' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiResponse({ status: 200, description: 'Proposal updated successfully' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.proposalService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete proposal' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Proposal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async delete(@Param('id') id: string) {
    return this.proposalService.delete(id);
  }

  @Post('rfp/:rfpId/compare')
  @ApiOperation({
    summary: 'Compare all proposals for an RFP',
    description: 'Uses AI to compare and score all proposals for the given RFP',
  })
  @ApiParam({ name: 'rfpId', description: 'RFP ID' })
  @ApiResponse({ status: 200, description: 'Comparison results with scores' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async compareProposals(@Param('rfpId') rfpId: string) {
    return this.proposalService.compareProposals(rfpId);
  }

  @Post('rfp/:rfpId/recommend')
  @ApiOperation({
    summary: 'Get AI recommendation for best vendor',
    description: 'Analyzes all proposals and provides a recommendation on which vendor to choose',
  })
  @ApiParam({ name: 'rfpId', description: 'RFP ID' })
  @ApiResponse({ status: 200, description: 'Recommendation with reasoning' })
  @ApiResponse({ status: 404, description: 'RFP not found' })
  async getRecommendation(@Param('rfpId') rfpId: string) {
    return this.proposalService.getRecommendation(rfpId);
  }
}
