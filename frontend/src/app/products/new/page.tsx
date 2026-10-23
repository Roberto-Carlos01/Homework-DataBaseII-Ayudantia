'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/ProductForm';
import { createProduct } from '@/lib/api';

// /products/new -> crear producto
export default function NewProductPage() {
  const router = useRouter();

  return (
    <div>
      <Link href="/products" className="text-sm text-slate-500 hover:underline">
        ← Volver a productos
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Nuevo producto</h1>

      <ProductForm
        submitLabel="Crear producto"
        onSubmit={async (input) => {
          const product = await createProduct(input);
          router.push(`/products/${product.id}`);
        }}
      />
    </div>
  );
}
