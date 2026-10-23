'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { deleteProduct, getProduct } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

// /products/[id] -> ver producto
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProduct(Number(id))
      .then(setProduct)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function handleDelete() {
    if (!product || !confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      router.push('/products');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <Link href="/products" className="text-sm text-slate-500 hover:underline">
        ← Volver a productos
      </Link>

      <div className="mt-4">
        <ErrorMessage message={error} />
      </div>

      {!product && !error && <p className="text-slate-500">Cargando...</p>}

      {product && (
        <div className="card max-w-xl">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2 text-slate-600">{product.description}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Precio</dt>
              <dd className="text-lg font-semibold">{formatPrice(product.price)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Stock</dt>
              <dd className="text-lg font-semibold">{product.stock}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Categoría</dt>
              <dd className="text-lg font-semibold">{product.category?.name}</dd>
            </div>
          </dl>

          <div className="mt-6 flex gap-2">
            <Link href={`/products/${product.id}/edit`} className="btn-primary">
              Editar
            </Link>
            <button onClick={handleDelete} className="btn-danger">
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
