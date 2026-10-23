'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { deleteProduct, getProducts } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

// /products -> lista de productos
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/products/new" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/products/${product.id}`} className="text-blue-700 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.description}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={product.stock === 0 ? 'font-semibold text-red-600' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/products/${product.id}/edit`} className="btn-secondary">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(product)} className="btn-danger">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    No hay productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
