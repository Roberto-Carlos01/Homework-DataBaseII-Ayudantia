import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';

// Representa la tabla "products" creada por init.sql
@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // PostgreSQL devuelve NUMERIC como texto ("189.90").
  // El transformer lo convierte a número para que la API responda 189.9
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  // Columna category_id de la tabla; en la API se llama categoryId
  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  // Muchos productos pertenecen a una categoría
  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
