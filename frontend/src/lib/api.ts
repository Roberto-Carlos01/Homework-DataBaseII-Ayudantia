// Capa HTTP: TODAS las llamadas al backend pasan por aquí.
// La URL del backend se define en un solo lugar: NEXT_PUBLIC_API_URL.

import type { Category, CategoryInput, Product, ProductInput } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      cache: 'no-store',
    });
  } catch {
    // El backend no responde (apagado, puerto incorrecto, URL mal configurada...)
    throw new Error(`No se pudo conectar con el backend en ${API_URL}`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // NestJS devuelve { message: string | string[] }
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `Error ${response.status}`);
    throw new Error(message);
  }

  return data as T;
}

// ---------- Categorías ----------

export const getCategories = () => request<Category[]>('/categories');

export const createCategory = (input: CategoryInput) =>
  request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateCategory = (id: number, input: Partial<CategoryInput>) =>
  request<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteCategory = (id: number) =>
  request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' });

// ---------- Productos ----------

export const getProducts = () => request<Product[]>('/products');

export const getProduct = (id: number) => request<Product>(`/products/${id}`);

export const createProduct = (input: ProductInput) =>
  request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateProduct = (id: number, input: Partial<ProductInput>) =>
  request<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteProduct = (id: number) =>
  request<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
