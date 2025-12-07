import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromptDto, UpdatePromptDto } from './dto/prompt.dto';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromptDto) {
    try {
      const prompt = await this.prisma.aIPrompt.create({
        data: dto,
      });
      return prompt;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Prompt with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.aIPrompt.findMany({
      orderBy: {
        promptType: 'asc',
      },
    });
  }

  async findByType(promptType: string) {
    return this.prisma.aIPrompt.findMany({
      where: { promptType: promptType as any },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const prompt = await this.prisma.aIPrompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with ID ${id} not found`);
    }

    return prompt;
  }

  async update(id: string, dto: UpdatePromptDto) {
    try {
      const prompt = await this.prisma.aIPrompt.update({
        where: { id },
        data: dto,
      });
      return prompt;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Prompt with this name already exists');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.aIPrompt.delete({
        where: { id },
      });
      return { message: 'Prompt deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }
      throw error;
    }
  }
}
