'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api';
import type { Category, Product, ProductInput } from '@/lib/types';
import { ErrorMessage } from './ErrorMessage';

interface Props {
  initial?: Product;
  submitLabel: string;
  onSubmit: (input: ProductInput) => Promise<void>;
}

// Formulario reutilizado para crear (/products/new) y editar (/products/[id]/edit)
export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '0');
  const [categoryId, setCategoryId] = useState(
    initial ? String(initial.categoryId) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
      });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      <ErrorMessage message={error} />

      <div>
        <label className="label" htmlFor="name">Nombre</label>
        <input
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={150}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Descripción</label>
        <textarea
          id="description"
          className="input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="price">Precio</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            step="1"
            min="0"
            className="input"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="category">Categoría</label>
        <select
          id="category"
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}
