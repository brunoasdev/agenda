'use client';

import { useEffect, useState } from 'react';
import { Congregacao, Regiao } from '@/types';
import { congregacaoService } from '@/services/congregacaoService';
import { regiaoService } from '@/services/regiaoService';

export default function CongregacoesPage() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [regiaoId, setRegiaoId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
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

      limparFormulario();
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
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
  };

  // ✅ Função handleDelete adicionada
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta congregação?')) return;

    try {
      await congregacaoService.delete(id);
      carregarDados();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir congregação");
    }
  };

  const limparFormulario = () => {
    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
    setRegiaoId('');
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Cadastro de Congregações</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Região</label>
              <select
                value={regiaoId}
                onChange={(e) => setRegiaoId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                required
              >
                <option value="">Selecione uma região</option>
                {regioes.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-400">Nome da Congregação</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-zinc-400">Endereço</label>
              <input 
                type="text" 
                value={endereco} 
                onChange={e => setEndereco(e.target.value)} 
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-400">Latitude</label>
              <input 
                type="number" 
                step="any" 
                value={latitude} 
                onChange={e => setLatitude(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-400">Longitude</label>
              <input 
                type="number" 
                step="any" 
                value={longitude} 
                onChange={e => setLongitude(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" 
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 bg-blue-600 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-70"
            >
              {submitting ? 'Salvando...' : editingId ? 'Atualizar Congregação' : 'Cadastrar Congregação'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={limparFormulario} 
                className="px-8 bg-zinc-800 hover:bg-zinc-700 py-3.5 rounded-xl transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Lista de Congregações */}
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">Congregações Cadastradas ({congregacoes.length})</h2>
          </div>

          <div className="divide-y divide-zinc-800">
            {congregacoes.map(cong => {
              const regiao = regioes.find(r => r.id === cong.regiaoId);
              return (
                <div key={cong.id} className="p-6 hover:bg-zinc-800/50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{cong.nome}</h3>
                      <p className="text-zinc-400 mt-1">{cong.endereco}</p>
                      <p className="text-sm text-zinc-500 mt-2">
                        Região: <span className="text-blue-400">{regiao?.nome || 'Não informada'}</span>
                      </p>
                      {cong.latitude !== 0 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          📍 {cong.latitude}, {cong.longitude}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleEdit(cong)} 
                        className="text-blue-400 hover:text-blue-500 font-medium"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(cong.id)} 
                        className="text-red-400 hover:text-red-500 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}