'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Regiao } from '@/types';
import { regiaoService } from '@/services/regiaoService';
import { congregacaoService } from '@/services/congregacaoService';

export default function RegioesPage() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [contagem, setContagem] = useState<Record<string, number>>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [regs, congs] = await Promise.all([
        regiaoService.getAll(),
        congregacaoService.getAll()
      ]);

      setRegioes(regs);

      const contagemTemp: Record<string, number> = {};
      congs.forEach(cong => {
        contagemTemp[cong.regiaoId] = (contagemTemp[cong.regiaoId] || 0) + 1;
      });
      setContagem(contagemTemp);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await regiaoService.update(editingId, { nome: nome.trim() });
      } else {
        await regiaoService.create({ nome: nome.trim() });
      }
      setNome('');
      setEditingId(null);
      carregarDados();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (regiao: Regiao) => {
    setNome(regiao.nome);
    setEditingId(regiao.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta região?')) return;
    try {
      await regiaoService.delete(id);
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir região");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Regiões</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 mb-10">
          <div className="flex gap-4">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da região"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-medium transition"
            >
              {editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>

        {/* Lista */}
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">Regiões Cadastradas ({regioes.length})</h2>
          </div>

          <div className="divide-y divide-zinc-800">
            {regioes.map((regiao) => {
              const qtd = contagem[regiao.id] || 0;
              const podeExcluir = qtd === 0;

              return (
                <div key={regiao.id} className="p-6 flex justify-between items-center hover:bg-zinc-800/50 transition">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{regiao.nome}</span>
                    
                    {qtd > 0 && (
                      <span className="bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        {qtd} congregações
                      </span>
                    )}
                  </div>

                  <div className="flex gap-6 text-2xl">
                    <button
                      onClick={() => handleEdit(regiao)}
                      className="text-blue-400 hover:text-blue-500 hover:scale-125 transition-all"
                      title="Editar"
                    >
                      <Edit size={22} />
                    </button>
                    <button
                      onClick={() => podeExcluir && handleDelete(regiao.id)}
                      disabled={!podeExcluir}
                      className={`transition-all hover:scale-125 ${
                        podeExcluir 
                          ? "text-red-400 hover:text-red-500" 
                          : "text-zinc-600 cursor-not-allowed opacity-50"
                      }`}
                      title={podeExcluir ? "Excluir região" : "Não é possível excluir - existem congregações associadas"}
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              );
            })}

            {regioes.length === 0 && (
              <p className="p-12 text-center text-zinc-500">Nenhuma região cadastrada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}