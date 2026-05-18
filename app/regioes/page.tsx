'use client';

import { useEffect, useState } from 'react';
import { Regiao } from '@/types';
import { regiaoService } from '@/services/regiaoService';

export default function RegioesPage() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarRegioes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regiaoService.getAll();
      setRegioes(data);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar dados do Firebase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegioes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      if (editingId) {
        await regiaoService.update(editingId, { nome: nome.trim() });
      } else {
        await regiaoService.create({ nome: nome.trim() });
      }
      setNome('');
      setEditingId(null);
      carregarRegioes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta região?')) return;
    try {
      await regiaoService.delete(id);
      carregarRegioes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Cadastro de Regiões
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 mb-8">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da região"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl font-medium transition"
            >
              {editingId ? 'Atualizar Região' : 'Cadastrar Região'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setNome(''); }}
                className="px-6 bg-zinc-800 hover:bg-zinc-700 py-3.5 rounded-xl font-medium transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Lista */}
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Regiões Cadastradas</h2>
            <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-sm font-medium">
              {regioes.length}
            </span>
          </div>

          {loading && (
            <p className="p-12 text-center text-zinc-500">Carregando regiões...</p>
          )}

          {error && (
            <p className="p-8 text-center text-red-500">{error}</p>
          )}

          {!loading && regioes.length === 0 && !error && (
            <p className="p-12 text-center text-zinc-500">Nenhuma região cadastrada ainda.</p>
          )}

          <ul>
            {regioes.map((regiao) => (
              <li
                key={regiao.id}
                className="p-6 border-b border-zinc-800 last:border-none flex justify-between items-center hover:bg-zinc-800/50 transition"
              >
                <span className="text-lg text-zinc-100">{regiao.nome}</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setNome(regiao.nome);
                      setEditingId(regiao.id);
                    }}
                    className="text-blue-400 hover:text-blue-500 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(regiao.id)}
                    className="text-red-400 hover:text-red-500 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}