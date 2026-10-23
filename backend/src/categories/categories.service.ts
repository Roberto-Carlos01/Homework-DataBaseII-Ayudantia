import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  findAll() {
    return this.categoriesRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!category) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create(dto);
    return this.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    // preload: busca la categoría por id y le aplica los cambios del DTO
    const category = await this.categoriesRepository.preload({ id, ...dto });
    if (!category) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return this.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (category.products.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría ${id} porque tiene productos`,
      );
    }
    await this.categoriesRepository.delete(id);
    return { message: `Categoría ${id} eliminada` };
  }

  private async save(category: CategoryEntity) {
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      // 23505 = violación de UNIQUE en PostgreSQL (nombre repetido)
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          `Ya existe una categoría llamada "${category.name}"`,
        );
      }
      throw error;
    }
  }
}
