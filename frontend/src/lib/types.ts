// Tipos que coinciden con las respuestas del backend NestJS

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  category: Category;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
}
