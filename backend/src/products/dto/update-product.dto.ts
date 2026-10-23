import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Igual que CreateProductDto, pero todos los campos son opcionales
export class UpdateProductDto extends PartialType(CreateProductDto) {}
