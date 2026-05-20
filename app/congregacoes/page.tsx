'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { Congregacao, Regiao } from '@/types';
import { congregacaoService } from '@/services/congregacaoService';
import { regiaoService } from '@/services/regiaoService';

export default function CongregacoesPage() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [regiaoId, setRegiaoId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [congs, regs] = await Promise.all([
        congregacaoService.getAll(),
        regiaoService.getAll()
      ]);
      setCongregacoes(congs);
      setRegioes(regs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const congregacoesFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return congregacoes;
    const term = searchTerm.toLowerCase().trim();
    return congregacoes.filter(cong => 
      cong.nome.toLowerCase().includes(term)
    );
  }, [congregacoes, searchTerm]);

  const abrirFormulario = () => {
    limparFormulario();
    setShowForm(true);
  };

  const fecharFormulario = () => {
    limparFormulario();
    setShowForm(false);
  };

  const limparFormulario = () => {
    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
    setRegiaoId('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !endereco || !regiaoId) return;

    setSubmitting(true);
    try {
      const data = {
        nome: nome.trim(),
        endereco: endereco.trim(),
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        regiaoId
      };

      if (editingId) {
        await congregacaoService.update(editingId, data);
      } else {
        await congregacaoService.create(data);
      }

      fecharFormulario();
      carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar congregação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cong: Congregacao) => {
    setNome(cong.nome);
    setEndereco(cong.endereco);
    setLatitude(cong.latitude.toString());
    setLongitude(cong.longitude.toString());
    setRegiaoId(cong.regiaoId);
    setEditingId(cong.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta congregação?')) return;
    try {
      await congregacaoService.delete(id);
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Congregações</h1>
          
          {!showForm && (
            <button
              onClick={abrirFormulario}
              className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg"
              title="Nova Congregação"
            >
              <Plus size={28} />
            </button>
          )}
        </div>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 mb-8">
            {/* Formulário mantido igual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-zinc-400">Região</label>
                <select value={regiaoId} onChange={(e) => setRegiaoId(e.target.value)} required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3">
                  <option value="">Selecione uma região</option>
                  {regioes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-400">Nome da Congregação</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-zinc-400">Endereço</label>
                <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} required className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-400">Latitude</label>
                <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-400">Longitude</label>
                <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 py-3.5 rounded-xl font-medium hover:bg-blue-700">
                {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={fecharFormulario} className="px-8 bg-zinc-800 hover:bg-zinc-700 py-3.5 rounded-xl">
                <X size={24} />
              </button>
            </div>
          </form>
        )}

        {/* Campo de Pesquisa - Agora abaixo do formulário */}
        <div className="mb-6 relative">
          <div className="absolute left-4 top-3.5 text-zinc-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar congregação por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-12 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Lista */}
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">
              Congregações Cadastradas ({congregacoesFiltradas.length})
            </h2>
          </div>

          <div className="divide-y divide-zinc-800">
            {congregacoesFiltradas.map(cong => {
              const regiao = regioes.find(r => r.id === cong.regiaoId);
              return (
                <div key={cong.id} className="p-6 hover:bg-zinc-800/50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{cong.nome}</h3>
                      <p className="text-zinc-400 mt-1">{cong.endereco}</p>
                      <p className="text-sm text-zinc-500 mt-2">
                        Região: <span className="text-blue-400">{regiao?.nome}</span>
                      </p>
                    </div>

                    <div className="flex gap-6 text-2xl">
                      <button onClick={() => handleEdit(cong)} className="text-blue-400 hover:text-blue-500 hover:scale-125 transition-all" title="Editar">
                        <Edit size={22} />
                      </button>
                      <button onClick={() => handleDelete(cong.id)} className="text-red-400 hover:text-red-500 hover:scale-125 transition-all" title="Excluir">
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {congregacoesFiltradas.length === 0 && (
              <p className="p-12 text-center text-zinc-500">
                {searchTerm ? `Nenhuma congregação encontrada para "${searchTerm}"` : "Nenhuma congregação cadastrada ainda."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}