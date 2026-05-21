'use client';

import {
  useEffect,
  useState,
  useMemo,
  useCallback
} from 'react';

import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Map,
  Church,
  Loader2
} from 'lucide-react';

import { toast } from 'sonner';

import { Regiao } from '@/types';

import { regiaoService } from '@/services/regiaoService';
import { congregacaoService } from '@/services/congregacaoService';

export default function RegioesPage() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] =
    useState('');

  const [paginaAtual, setPaginaAtual] =
    useState(1);

  const itensPorPagina = 5;

  const [formData, setFormData] = useState({
    nome: ''
  });

  const [contagem, setContagem] =
    useState<Record<string, number>>({});

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(search);
      setPaginaAtual(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      const [regs, congs] = await Promise.all([
        regiaoService.getAll(),
        congregacaoService.getAll()
      ]);

      setRegioes(regs);

      const contagemTemp: Record<
        string,
        number
      > = {};

      congs.forEach((cong) => {
        contagemTemp[cong.regiaoId] =
          (contagemTemp[cong.regiaoId] ||
            0) + 1;
      });

      setContagem(contagemTemp);
    } catch (error) {
      console.error(error);
      toast.error(
        'Erro ao carregar regiões'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const regioesFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return regioes;

    const term = searchTerm
      .toLowerCase()
      .trim();

    return regioes.filter((regiao) =>
      regiao.nome
        .toLowerCase()
        .includes(term)
    );
  }, [regioes, searchTerm]);

  const totalPaginas = Math.ceil(
    regioesFiltradas.length / itensPorPagina
  );

  const regioesPaginadas = useMemo(() => {
    const inicio =
      (paginaAtual - 1) * itensPorPagina;

    const fim = inicio + itensPorPagina;

    return regioesFiltradas.slice(
      inicio,
      fim
    );
  }, [regioesFiltradas, paginaAtual]);

  const limparFormulario = useCallback(() => {
    setFormData({
      nome: ''
    });

    setEditingId(null);
  }, []);

  const abrirFormulario = useCallback(() => {
    limparFormulario();
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [limparFormulario]);

  const fecharFormulario = useCallback(() => {
    limparFormulario();
    setShowForm(false);
  }, [limparFormulario]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formData.nome.trim()) return;

    try {
      setSubmitting(true);

      const data = {
        nome: formData.nome.trim()
      };

      if (editingId) {
        await regiaoService.update(
          editingId,
          data
        );

        setRegioes((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, ...data }
              : item
          )
        );

        toast.success(
          'Região atualizada'
        );
      } else {
        const nova =
          await regiaoService.create(data);

        setRegioes((prev) => [
          nova,
          ...prev
        ]);

        toast.success(
          'Região cadastrada'
        );
      }

      fecharFormulario();
    } catch (error) {
      console.error(error);
      toast.error(
        'Erro ao salvar região'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback(
    (regiao: Regiao) => {
      setFormData({
        nome: regiao.nome
      });

      setEditingId(regiao.id);
      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmar = window.confirm(
        'Tem certeza que deseja excluir esta região?'
      );

      if (!confirmar) return;

      try {
        await regiaoService.delete(id);

        setRegioes((prev) =>
          prev.filter(
            (item) => item.id !== id
          )
        );

        toast.success(
          'Região excluída'
        );
      } catch (error) {
        console.error(error);
        toast.error(
          'Erro ao excluir região'
        );
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="animate-spin" />
          Carregando regiões...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8 gap-4">

          <div>
            <h1 className="text-4xl font-bold">
              Regiões
            </h1>

            <p className="text-zinc-500 mt-2">
              Gerencie as regiões
            </p>
          </div>

          {!showForm && (
            <button
              onClick={abrirFormulario}
              className="bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-lg hover:scale-105"
            >
              <Plus size={28} />
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Map className="text-blue-400" />

              <h2 className="text-2xl font-semibold">
                {editingId
                  ? 'Editar Região'
                  : 'Nova Região'}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-4">

              <input
                disabled={submitting}
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({
                    nome: e.target.value
                  })
                }
                placeholder="Nome da região"
                required
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              />

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-2xl"
                >
                  {editingId
                    ? 'Atualizar'
                    : 'Cadastrar'}
                </button>

                <button
                  type="button"
                  onClick={fecharFormulario}
                  className="px-5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mb-6 relative">
          <div className="absolute left-4 top-3.5 text-zinc-500">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Buscar região..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-12 py-3"
          />
        </div>

        <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">

          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">
              Regiões (
              {regioesFiltradas.length})
            </h2>
          </div>

          <div className="divide-y divide-zinc-800">

            {regioesPaginadas.map(
              (regiao) => {
                const qtd =
                  contagem[regiao.id] || 0;

                const podeExcluir =
                  qtd === 0;

                return (
                  <div
                    key={regiao.id}
                    className="p-6 hover:bg-zinc-800/40 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      <div className="flex items-center gap-4 flex-wrap">

                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Map
                            size={22}
                            className="text-blue-400"
                          />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">

                          <h3 className="text-xl font-semibold">
                            {regiao.nome}
                          </h3>

                          <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <Church size={14} />
                            {qtd}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            handleEdit(regiao)
                          }
                          className="w-11 h-11 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          onClick={() =>
                            podeExcluir &&
                            handleDelete(
                              regiao.id
                            )
                          }
                          disabled={!podeExcluir}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                            podeExcluir
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                              : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            {regioesFiltradas.length ===
              0 && (
              <div className="p-16 text-center">
                <Map
                  size={60}
                  className="mx-auto text-zinc-700 mb-5"
                />

                <h3 className="text-2xl font-semibold text-zinc-300">
                  Nenhuma região encontrada
                </h3>
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-zinc-800 flex-wrap">

                <button
                  onClick={() =>
                    setPaginaAtual((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={paginaAtual === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-800"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                {Array.from({
                  length: totalPaginas
                }).map((_, index) => {
                  const pagina = index + 1;

                  return (
                    <button
                      key={pagina}
                      onClick={() =>
                        setPaginaAtual(pagina)
                      }
                      className={`w-11 h-11 rounded-2xl ${
                        paginaAtual === pagina
                          ? 'bg-blue-600'
                          : 'bg-zinc-800'
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setPaginaAtual((prev) =>
                      Math.min(
                        prev + 1,
                        totalPaginas
                      )
                    )
                  }
                  disabled={
                    paginaAtual === totalPaginas
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-800"
                >
                  Próxima
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}