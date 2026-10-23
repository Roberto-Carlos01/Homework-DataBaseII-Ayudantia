'use client';

import { useEffect, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/api';
import type { Category } from '@/lib/types';

// /categories -> listar, crear, editar y eliminar categorías
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de creación
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  function load() {
    getCategories()
      .then(setCategories)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Ejecuta una acción, muestra el error si falla y recarga la lista
  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const ok = await run(() =>
      createCategory({ name, description: description || undefined }),
    );
    if (ok) {
      setName('');
      setDescription('');
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? '');
  }

  async function handleUpdate(id: number) {
    const ok = await run(() =>
      updateCategory(id, { name: editName, description: editDescription }),
    );
    if (ok) setEditingId(null);
  }

  async function handleDelete(category: Category) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    await run(() => deleteCategory(category.id));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categorías</h1>

      <ErrorMessage message={error} />

      <form onSubmit={handleCreate} className="card mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-48 flex-1">
          <label className="label" htmlFor="name">Nombre</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="min-w-64 flex-[2]">
          <label className="label" htmlFor="description">Descripción</label>
          <input
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
          />
        </div>
        <button type="submit" className="btn-primary">
          + Crear categoría
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) =>
                editingId === category.id ? (
                  <tr key={category.id} className="border-t border-slate-100 bg-blue-50">
                    <td className="px-4 py-2">
                      <input
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={100}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="input"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        maxLength={255}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdate(category.id)} className="btn-primary">
                          Guardar
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-secondary">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={category.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-slate-600">{category.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(category)} className="btn-secondary">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(category)} className="btn-danger">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
              {categories.length === 0 && !error && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    No hay categorías.
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
