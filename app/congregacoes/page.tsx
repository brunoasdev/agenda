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
  Loader2,
  Church,
  MapPinned
} from 'lucide-react';

import { toast } from 'sonner';

import {
  Congregacao,
  Regiao
} from '@/types';

import { congregacaoService } from '@/services/congregacaoService';
import { regiaoService } from '@/services/regiaoService';

export default function CongregacoesPage() {
  /*
   |--------------------------------------------------------------------------
   | States
   |--------------------------------------------------------------------------
   */

  const [congregacoes, setCongregacoes] =
    useState<Congregacao[]>([]);

  const [regioes, setRegioes] =
    useState<Regiao[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [paginaAtual, setPaginaAtual] =
    useState(1);

  const itensPorPagina = 5;

  const [formData, setFormData] =
    useState({
      nome: '',
      endereco: '',
      latitude: '',
      longitude: '',
      regiaoId: ''
    });

  /*
   |--------------------------------------------------------------------------
   | Debounce Search
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(search);
      setPaginaAtual(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /*
   |--------------------------------------------------------------------------
   | Load Data
   |--------------------------------------------------------------------------
   */

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      const [congs, regs] =
        await Promise.all([
          congregacaoService.getAll(),
          regiaoService.getAll()
        ]);

      setCongregacoes(congs);
      setRegioes(regs);
    } catch (error) {
      console.error(error);

      toast.error(
        'Erro ao carregar congregações'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /*
   |--------------------------------------------------------------------------
   | Filter
   |--------------------------------------------------------------------------
   */

  const congregacoesFiltradas =
    useMemo(() => {
      if (!searchTerm.trim())
        return congregacoes;

      const term = searchTerm
        .toLowerCase()
        .trim();

      return congregacoes.filter(
        (cong) =>
          cong.nome
            .toLowerCase()
            .includes(term)
      );
    }, [congregacoes, searchTerm]);

  /*
   |--------------------------------------------------------------------------
   | Pagination
   |--------------------------------------------------------------------------
   */

  const totalPaginas = Math.ceil(
    congregacoesFiltradas.length /
      itensPorPagina
  );

  const congregacoesPaginadas =
    useMemo(() => {
      const inicio =
        (paginaAtual - 1) *
        itensPorPagina;

      const fim =
        inicio + itensPorPagina;

      return congregacoesFiltradas.slice(
        inicio,
        fim
      );
    }, [
      congregacoesFiltradas,
      paginaAtual
    ]);

  /*
   |--------------------------------------------------------------------------
   | Form
   |--------------------------------------------------------------------------
   */

  const limparFormulario =
    useCallback(() => {
      setFormData({
        nome: '',
        endereco: '',
        latitude: '',
        longitude: '',
        regiaoId: ''
      });

      setEditingId(null);
    }, []);

  const abrirFormulario =
    useCallback(() => {
      limparFormulario();
      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, [limparFormulario]);

  const fecharFormulario =
    useCallback(() => {
      limparFormulario();
      setShowForm(false);
    }, [limparFormulario]);

  /*
   |--------------------------------------------------------------------------
   | Submit
   |--------------------------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !formData.nome ||
      !formData.endereco ||
      !formData.regiaoId
    )
      return;

    try {
      setSubmitting(true);

      const data = {
        nome: formData.nome.trim(),
        endereco:
          formData.endereco.trim(),
        latitude:
          parseFloat(
            formData.latitude
          ) || 0,
        longitude:
          parseFloat(
            formData.longitude
          ) || 0,
        regiaoId:
          formData.regiaoId
      };

      if (editingId) {
        await congregacaoService.update(
          editingId,
          data
        );

        setCongregacoes((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...data
                }
              : item
          )
        );

        toast.success(
          'Congregação atualizada'
        );
      } else {
        const nova =
          await congregacaoService.create(
            data
          );

        setCongregacoes((prev) => [
          nova,
          ...prev
        ]);

        toast.success(
          'Congregação cadastrada'
        );
      }

      fecharFormulario();
    } catch (error) {
      console.error(error);

      toast.error(
        'Erro ao salvar congregação'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | Edit
   |--------------------------------------------------------------------------
   */

  const handleEdit = useCallback(
    (cong: Congregacao) => {
      setFormData({
        nome: cong.nome,
        endereco: cong.endereco,
        latitude:
          cong.latitude.toString(),
        longitude:
          cong.longitude.toString(),
        regiaoId: cong.regiaoId
      });

      setEditingId(cong.id);

      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    []
  );

  /*
   |--------------------------------------------------------------------------
   | Delete
   |--------------------------------------------------------------------------
   */

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmar =
        window.confirm(
          'Tem certeza que deseja excluir esta congregação?'
        );

      if (!confirmar) return;

      try {
        await congregacaoService.delete(
          id
        );

        setCongregacoes((prev) =>
          prev.filter(
            (item) => item.id !== id
          )
        );

        toast.success(
          'Congregação excluída'
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Erro ao excluir congregação'
        );
      }
    },
    []
  );

  /*
   |--------------------------------------------------------------------------
   | Loading
   |--------------------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="animate-spin" />
          Carregando congregações...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="flex justify-between items-center mb-8 gap-4">

          <div>
            <h1 className="text-4xl font-bold">
              Congregações
            </h1>

            <p className="text-zinc-500 mt-2">
              Gerencie as congregações
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

        {/* Form */}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Church className="text-blue-400" />

              <h2 className="text-2xl font-semibold">
                {editingId
                  ? 'Editar Congregação'
                  : 'Nova Congregação'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                required
                disabled={submitting}
                value={formData.regiaoId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regiaoId:
                      e.target.value
                  })
                }
                className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              >
                <option value="">
                  Selecione uma região
                </option>

                {regioes.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                required
                disabled={submitting}
                placeholder="Nome da congregação"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nome:
                      e.target.value
                  })
                }
                className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              />

              <input
                type="text"
                required
                placeholder="Endereço"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco:
                      e.target.value
                  })
                }
                className="md:col-span-2 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              />

              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude:
                      e.target.value
                  })
                }
                className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              />

              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude:
                      e.target.value
                  })
                }
                className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3"
              />
            </div>

            <div className="flex gap-3 mt-6">

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl"
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
          </form>
        )}

        {/* Search */}

        <div className="mb-6 relative">
          <div className="absolute left-4 top-3.5 text-zinc-500">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Buscar congregação..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-12 py-3"
          />
        </div>

        {/* List */}

        <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">

          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">
              Congregações (
              {
                congregacoesFiltradas.length
              }
              )
            </h2>
          </div>

          <div className="divide-y divide-zinc-800">

            {congregacoesPaginadas.map(
              (cong) => {
                const regiao =
                  regioes.find(
                    (r) =>
                      r.id ===
                      cong.regiaoId
                  );

                return (
                  <div
                    key={cong.id}
                    className="p-6 hover:bg-zinc-800/40 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Church
                            size={22}
                            className="text-blue-400"
                          />
                        </div>

                        <div>

                          <div className="flex items-center gap-3 flex-wrap">

                            <h3 className="text-xl font-semibold">
                              {cong.nome}
                            </h3>

                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm">
                              {
                                regiao?.nome
                              }
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-zinc-400 mt-3">
                            <MapPinned
                              size={16}
                            />

                            <p className="text-sm">
                              {
                                cong.endereco
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            handleEdit(
                              cong
                            )
                          }
                          className="w-11 h-11 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              cong.id
                            )
                          }
                          className="w-11 h-11 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            {congregacoesFiltradas.length ===
              0 && (
              <div className="p-16 text-center">

                <Church
                  size={60}
                  className="mx-auto text-zinc-700 mb-5"
                />

                <h3 className="text-2xl font-semibold text-zinc-300">
                  Nenhuma congregação encontrada
                </h3>
              </div>
            )}

            {/* Pagination */}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-zinc-800 flex-wrap">

                <button
                  onClick={() =>
                    setPaginaAtual((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={
                    paginaAtual === 1
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-800"
                >
                  <ChevronLeft
                    size={18}
                  />

                  Anterior
                </button>

                {Array.from({
                  length: totalPaginas
                }).map((_, index) => {
                  const pagina =
                    index + 1;

                  return (
                    <button
                      key={pagina}
                      onClick={() =>
                        setPaginaAtual(
                          pagina
                        )
                      }
                      className={`w-11 h-11 rounded-2xl ${
                        paginaAtual ===
                        pagina
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
                    paginaAtual ===
                    totalPaginas
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-800"
                >
                  Próxima

                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}