import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold">Sistema de Cadastro</h1>
        <p className="text-zinc-400 text-lg">Escolha uma das opções abaixo</p>

        <div className="space-y-4">
          <Link
            href="/regioes"
            className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xl py-5 px-10 rounded-2xl transition w-96 mx-auto"
          >
            📍 Gerenciar Regiões
          </Link>

          <Link
            href="/congregacoes"
            className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xl py-5 px-10 rounded-2xl transition w-96 mx-auto"
          >
            ⛪ Gerenciar Congregações
          </Link>
        </div>
      </div>
    </main>
  );
}