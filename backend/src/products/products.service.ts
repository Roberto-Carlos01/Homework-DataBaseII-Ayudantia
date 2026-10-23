import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  // Incluye la categoría de cada producto (JOIN con categories)
  findAll() {
    return this.productsRepository.find({
      relations: { category: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    await this.checkCategoryExists(dto.categoryId);
    const product = await this.productsRepository.save(
      this.productsRepository.create(dto),
    );
    return this.findOne(product.id);
  }

  async update(id: number, dto: UpdateProductDto) {
    if (dto.categoryId !== undefined) {
      await this.checkCategoryExists(dto.categoryId);
    }
    // preload: busca el producto por id y le aplica los cambios del DTO
    const product = await this.productsRepository.preload({ id, ...dto });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    await this.productsRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productsRepository.delete(id);
    return { message: `Producto ${id} eliminado` };
  }

  private async checkCategoryExists(categoryId: number) {
    const exists = await this.categoriesRepository.existsBy({ id: categoryId });
    if (!exists) {
      throw new BadRequestException(`La categoría ${categoryId} no existe`);
    }
  }
}
