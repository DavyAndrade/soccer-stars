import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Soccer Stars</h1>
      <p className="text-muted-foreground">
        RPG de futebol turn-based inspirado em Ao Ashi.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/saves?mode=new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-primary-foreground"
        >
          Começar Nova Carreira
        </Link>
        <Link
          href="/saves?mode=continue"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-2"
        >
          Continuar
        </Link>
      </div>
    </main>
  );
}
