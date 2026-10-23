import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// Igual que CreateCategoryDto, pero todos los campos son opcionales
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
