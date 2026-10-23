'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ProductForm } from '@/components/ProductForm';
import { getProduct, updateProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

// /products/[id]/edit -> editar producto
export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProduct(Number(id))
      .then(setProduct)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <div>
      <Link href={`/products/${id}`} className="text-sm text-slate-500 hover:underline">
        ← Volver al producto
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Editar producto</h1>

      <ErrorMessage message={error} />
      {!product && !error && <p className="text-slate-500">Cargando...</p>}

      {product && (
        <ProductForm
          initial={product}
          submitLabel="Guardar cambios"
          onSubmit={async (input) => {
            await updateProduct(product.id, input);
            router.push(`/products/${product.id}`);
          }}
        />
      )}
    </div>
  );
}
