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
  CalendarDays,
  Church,
  MapPin,
  Video
} from 'lucide-react';

import { toast } from 'sonner';

import {
  Congregacao,
  Evento
} from '@/types';

import { congregacaoService } from '@/services/congregacaoService';
import { eventoService } from '@/services/eventoService';

export default function EventosPage() {

  /*
   |--------------------------------------------------------------------------
   | STATES
   |--------------------------------------------------------------------------
   */

  const [eventos, setEventos] =
    useState<Evento[]>([]);

  const [congregacoes, setCongregacoes] =
    useState<Congregacao[]>([]);

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

  const itensPorPagina = 20;

  const [formData, setFormData] =
    useState({
      congregacaoId: '',
      tipo: 'SEMANAL',

      titulo: '',
      tema: '',
      dataHora: '',
      local: '',

      bannerUrl: '',
      videoDivulgUrl: '',

      preletorNome: '',
      preletorFotoUrl: '',

      cantorNome: '',
      cantorFotoUrl: ''
    });

  /*
   |--------------------------------------------------------------------------
   | HELPERS
   |--------------------------------------------------------------------------
   */

  const isFestividade =
    formData.tipo === 'FESTIVIDADE';

  const parseDataHora = (
    dataHora: string
  ) => {

    const match =
      dataHora.match(
        /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})H(\d{2})$/
      );

    if (!match)
      return 0;

    const [
      ,
      dia,
      mes,
      ano,
      hora,
      minuto
    ] = match;

    return new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto)
    ).getTime();
  };

  const eventoExpirado = (
    dataHora: string
  ) => {

    return (
      parseDataHora(dataHora) <
      Date.now()
    );
  };

  /*
   |--------------------------------------------------------------------------
   | SEARCH DEBOUNCE
   |--------------------------------------------------------------------------
   */

  useEffect(() => {

    const timeout =
      setTimeout(() => {

        setSearchTerm(search);
        setPaginaAtual(1);

      }, 300);

    return () =>
      clearTimeout(timeout);

  }, [search]);

  /*
   |--------------------------------------------------------------------------
   | LOAD
   |--------------------------------------------------------------------------
   */

  const carregarDados =
    useCallback(async () => {

      try {

        setLoading(true);

        const [
          eventosData,
          congregacoesData
        ] = await Promise.all([
          eventoService.getAll(),
          congregacaoService.getAll()
        ]);

        setEventos(eventosData);

        setCongregacoes(
          congregacoesData
        );

      } catch (error) {

        console.error(error);

        toast.error(
          'Erro ao carregar eventos'
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
   | FILTER
   |--------------------------------------------------------------------------
   */

  const eventosFiltrados =
    useMemo(() => {

      const term =
        searchTerm
          .toLowerCase()
          .trim();

      return [...eventos]

        .filter((evento) => {

          const congregacao =
            congregacoes.find(
              (c) =>
                c.id ===
                evento.congregacaoId
            );

          return (

            evento.titulo
              .toLowerCase()
              .includes(term)

            ||

            evento.tema
              ?.toLowerCase()
              .includes(term)

            ||

            congregacao?.nome
              .toLowerCase()
              .includes(term)
          );
        })

        .sort((a, b) => {

          const dataA =
            parseDataHora(
              a.dataHora
            );

          const dataB =
            parseDataHora(
              b.dataHora
            );

          return dataB - dataA;
        });

    }, [
      eventos,
      congregacoes,
      searchTerm
    ]);

  /*
   |--------------------------------------------------------------------------
   | PAGINATION
   |--------------------------------------------------------------------------
   */

  const totalPaginas =
    Math.ceil(
      eventosFiltrados.length /
      itensPorPagina
    );

  const eventosPaginados =
    useMemo(() => {

      const inicio =
        (paginaAtual - 1) *
        itensPorPagina;

      return eventosFiltrados.slice(
        inicio,
        inicio + itensPorPagina
      );

    }, [
      eventosFiltrados,
      paginaAtual
    ]);

  /*
   |--------------------------------------------------------------------------
   | FORM
   |--------------------------------------------------------------------------
   */

  const limparFormulario =
    useCallback(() => {

      setFormData({
        congregacaoId: '',
        tipo: 'SEMANAL',

        titulo: '',
        tema: '',
        dataHora: '',
        local: '',

        bannerUrl: '',
        videoDivulgUrl: '',

        preletorNome: '',
        preletorFotoUrl: '',

        cantorNome: '',
        cantorFotoUrl: ''
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
   | SUBMIT
   |--------------------------------------------------------------------------
   */

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        setSubmitting(true);

        const data = {
          ...formData,

          titulo:
            formData.titulo.trim(),

          tema:
            formData.tema.trim(),

          local:
            formData.local.trim()
        };

        if (editingId) {

          await eventoService.update(
            editingId,
            data
          );

          toast.success(
            'Evento atualizado'
          );

        } else {

          await eventoService.create(
            data
          );

          toast.success(
            'Evento cadastrado'
          );
        }

        fecharFormulario();

        carregarDados();

      } catch (error) {

        console.error(error);

        toast.error(
          'Erro ao salvar evento'
        );

      } finally {

        setSubmitting(false);
      }
    };

  /*
   |--------------------------------------------------------------------------
   | EDIT
   |--------------------------------------------------------------------------
   */

  const handleEdit =
    (
      evento: Evento
    ) => {

      if (
        eventoExpirado(
          evento.dataHora
        )
      ) {
        return;
      }

      setFormData({

        congregacaoId:
          evento.congregacaoId,

        tipo:
          evento.tipo,

        titulo:
          evento.titulo,

        tema:
          evento.tema || '',

        dataHora:
          evento.dataHora,

        local:
          evento.local,

        bannerUrl:
          evento.bannerUrl || '',

        videoDivulgUrl:
          evento.videoDivulgUrl || '',

        preletorNome:
          evento.preletorNome || '',

        preletorFotoUrl:
          evento.preletorFotoUrl || '',

        cantorNome:
          evento.cantorNome || '',

        cantorFotoUrl:
          evento.cantorFotoUrl || ''
      });

      setEditingId(evento.id);

      setShowForm(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

  /*
   |--------------------------------------------------------------------------
   | DELETE
   |--------------------------------------------------------------------------
   */

  const handleDelete =
    async (
      evento: Evento
    ) => {

      if (
        eventoExpirado(
          evento.dataHora
        )
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          'Deseja excluir este evento?'
        );

      if (!confirmar)
        return;

      try {

        await eventoService.delete(
          evento.id
        );

        toast.success(
          'Evento excluído'
        );

        carregarDados();

      } catch (error) {

        console.error(error);

        toast.error(
          'Erro ao excluir evento'
        );
      }
    };

  /*
   |--------------------------------------------------------------------------
   | LOADING
   |--------------------------------------------------------------------------
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">

        <div className="flex items-center gap-3 text-zinc-400">

          <Loader2 className="animate-spin" />

          Carregando eventos...

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Eventos
            </h1>

            <p className="text-zinc-500 mt-2">
              Gerencie os eventos das congregações
            </p>

          </div>

          {!showForm && (

            <button
              onClick={
                abrirFormulario
              }
              className="
                w-14
                h-14
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                flex
                items-center
                justify-center
                transition
                shadow-lg
              "
            >
              <Plus size={28} />
            </button>
          )}

        </div>

        {/* PESQUISA */}

        <div className="mb-6 relative">

          <div className="absolute left-4 top-3.5 text-zinc-500">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Buscar por título, tema ou congregação..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              pl-12
              pr-4
              py-3
              text-white
              placeholder:text-zinc-500
              focus:outline-none
              focus:border-blue-500
              transition
            "
          />

        </div>

        {/* FORM */}

        {showForm && (

          <form
            onSubmit={
              handleSubmit
            }
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              shadow-2xl
              mb-8
            "
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                required
                value={
                  formData.congregacaoId
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    congregacaoId:
                      e.target.value
                  })
                }
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              >
                <option value="">
                  Congregação
                </option>

                {congregacoes.map(
                  (cong) => (
                    <option
                      key={cong.id}
                      value={cong.id}
                    >
                      {cong.nome}
                    </option>
                  )
                )}

              </select>

              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo:
                      e.target.value
                  })
                }
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              >
                <option value="SEMANAL">
                  Semanal
                </option>

                <option value="FESTIVIDADE">
                  Festividade
                </option>

              </select>

              <input
                type="text"
                required
                placeholder="Título"
                value={
                  formData.titulo
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    titulo:
                      e.target.value
                  })
                }
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              <input
                type="text"
                placeholder="Tema"
                value={
                  formData.tema
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tema:
                      e.target.value
                  })
                }
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              <input
                type="text"
                required
                maxLength={16}
                placeholder="25/05/2026 19H00"
                value={
                  formData.dataHora
                }
                onChange={(e) => {

                  let value =
                    e.target.value.replace(
                      /\D/g,
                      ''
                    );

                  if (
                    value.length > 2
                  ) {
                    value =
                      value.slice(
                        0,
                        2
                      ) +
                      '/' +
                      value.slice(2);
                  }

                  if (
                    value.length > 5
                  ) {
                    value =
                      value.slice(
                        0,
                        5
                      ) +
                      '/' +
                      value.slice(5);
                  }

                  if (
                    value.length > 10
                  ) {
                    value =
                      value.slice(
                        0,
                        10
                      ) +
                      ' ' +
                      value.slice(10);
                  }

                  if (
                    value.length > 13
                  ) {
                    value =
                      value.slice(
                        0,
                        13
                      ) +
                      'H' +
                      value.slice(13);
                  }

                  value =
                    value.slice(
                      0,
                      16
                    );

                  setFormData({
                    ...formData,
                    dataHora:
                      value
                  });

                }}
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              <input
                type="text"
                required
                placeholder="Local"
                value={
                  formData.local
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    local:
                      e.target.value
                  })
                }
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              {isFestividade && (

                <>
                  <input
                    type="text"
                    placeholder="URL do banner"
                    value={
                      formData.bannerUrl
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bannerUrl:
                          e.target.value
                      })
                    }
                    className="
                      md:col-span-2
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                  <input
                    type="text"
                    placeholder="URL do vídeo de divulgação"
                    value={
                      formData.videoDivulgUrl
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        videoDivulgUrl:
                          e.target.value
                      })
                    }
                    className="
                      md:col-span-2
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                  <input
                    type="text"
                    placeholder="Nome do preletor"
                    value={
                      formData.preletorNome
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preletorNome:
                          e.target.value
                      })
                    }
                    className="
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                  <input
                    type="text"
                    placeholder="URL da foto do preletor"
                    value={
                      formData.preletorFotoUrl
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preletorFotoUrl:
                          e.target.value
                      })
                    }
                    className="
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                  <input
                    type="text"
                    placeholder="Nome do cantor"
                    value={
                      formData.cantorNome
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cantorNome:
                          e.target.value
                      })
                    }
                    className="
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                  <input
                    type="text"
                    placeholder="URL da foto do cantor"
                    value={
                      formData.cantorFotoUrl
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cantorFotoUrl:
                          e.target.value
                      })
                    }
                    className="
                      bg-zinc-800
                      border
                      border-zinc-700
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />
                </>
              )}

            </div>

            <div className="flex gap-3 mt-6">

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="
                  flex-1
                  bg-blue-600
                  hover:bg-blue-700
                  rounded-2xl
                  py-3
                  font-medium
                  transition
                "
              >

                {submitting
                  ? 'Salvando...'
                  : editingId
                  ? 'Atualizar'
                  : 'Cadastrar'}

              </button>

              <button
                type="button"
                onClick={
                  fecharFormulario
                }
                className="
                  px-6
                  bg-zinc-800
                  hover:bg-zinc-700
                  rounded-2xl
                "
              >
                <X size={22} />
              </button>

            </div>

          </form>
        )}

                {/* LISTA */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              Eventos Cadastrados
            </h2>

            <span className="text-zinc-500 text-sm">
              {eventosFiltrados.length} registros
            </span>

          </div>

          <div className="divide-y divide-zinc-800">

            {eventosPaginados.map((evento) => {

              const congregacao =
                congregacoes.find(
                  (c) =>
                    c.id ===
                    evento.congregacaoId
                );

              const expirado =
                eventoExpirado(
                  evento.dataHora
                );

              return (

                <div
                  key={evento.id}
                  className={`
                    p-6
                    transition
                    hover:bg-zinc-800/40
                    ${
                      expirado
                        ? 'opacity-40'
                        : ''
                    }
                  `}
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    {/* ESQUERDA */}

                    <div className="space-y-3 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold">
                          {evento.titulo}
                        </h3>

                        <span
                          className={`
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-medium
                            ${
                              evento.tipo === 'FESTIVIDADE'
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }
                          `}
                        >
                          {evento.tipo}
                        </span>

                      </div>

                      {evento.tema && (

                        <p className="text-zinc-400">
                          {evento.tema}
                        </p>

                      )}

                      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 text-sm text-zinc-400">

                        <div className="flex items-center gap-2">
                          <Church size={16} />
                          {congregacao?.nome}
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {evento.dataHora}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {evento.local}
                        </div>

                        {evento.videoDivulgUrl && (

                          <div className="flex items-center gap-2 text-red-400">
                            <Video size={16} />
                            Vídeo divulgação
                          </div>

                        )}

                      </div>

                      {evento.tipo === 'FESTIVIDADE' && (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                          {evento.preletorNome && (

                            <div className="bg-zinc-800 rounded-2xl p-4">

                              <p className="text-zinc-500 text-xs mb-1">
                                PRELETOR
                              </p>

                              <p className="font-medium">
                                {evento.preletorNome}
                              </p>

                            </div>

                          )}

                          {evento.cantorNome && (

                            <div className="bg-zinc-800 rounded-2xl p-4">

                              <p className="text-zinc-500 text-xs mb-1">
                                CANTOR
                              </p>

                              <p className="font-medium">
                                {evento.cantorNome}
                              </p>

                            </div>

                          )}

                        </div>

                      )}

                    </div>

                    {/* AÇÕES */}

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() =>
                          handleEdit(evento)
                        }
                        disabled={expirado}
                        className={`
                          w-11
                          h-11
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                          transition
                          ${
                            expirado
                              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                              : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          }
                        `}
                      >
                        <Edit size={20} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(evento)
                        }
                        disabled={expirado}
                        className={`
                          w-11
                          h-11
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                          transition
                          ${
                            expirado
                              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }
                        `}
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

            {eventosFiltrados.length === 0 && (

              <div className="p-16 text-center text-zinc-500">

                Nenhum evento encontrado.

              </div>

            )}

          </div>

          {/* PAGINAÇÃO */}

          {totalPaginas > 1 && (

            <div className="p-6 border-t border-zinc-800 flex items-center justify-center gap-2 flex-wrap">

              <button
                onClick={() =>
                  setPaginaAtual((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={paginaAtual === 1}
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-zinc-800
                  hover:bg-zinc-700
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  flex
                  items-center
                  justify-center
                  transition
                "
              >
                <ChevronLeft size={18} />
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
                    className={`
                      w-11
                      h-11
                      rounded-2xl
                      transition
                      ${
                        paginaAtual === pagina
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }
                    `}
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
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-zinc-800
                  hover:bg-zinc-700
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  flex
                  items-center
                  justify-center
                  transition
                "
              >
                <ChevronRight size={18} />
              </button>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}