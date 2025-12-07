import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendorDto) {
    try {
      const vendor = await this.prisma.vendor.create({
        data: dto,
      });
      return vendor;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Vendor with this email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.vendor.findMany({
      include: {
        rfpVendors: {
          include: {
            rfp: true,
          },
        },
        proposals: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        rfpVendors: {
          include: {
            rfp: true,
          },
        },
        proposals: {
          include: {
            rfp: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto) {
    try {
      const vendor = await this.prisma.vendor.update({
        where: { id },
        data: dto,
      });
      return vendor;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Vendor with this email already exists');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.vendor.delete({
        where: { id },
      });
      return { message: 'Vendor deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getStats() {
    const total = await this.prisma.vendor.count();
    const withProposals = await this.prisma.vendor.count({
      where: {
        proposals: {
          some: {},
        },
      },
    });

    return {
      total,
      withProposals,
      withoutProposals: total - withProposals,
    };
  }
}
