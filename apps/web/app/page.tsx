import { HealthStatus } from '../components/health-status';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,156,255,0.18),_transparent_35%),linear-gradient(180deg,_#050816_0%,_#040611_100%)] px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col justify-center gap-10">
        <section className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Synapse</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
            Inverti tu atencion en la persona que queres llegar a ser.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            El primer Walking Skeleton valida el circuito completo entre navegador, frontend,
            API y base de datos para construir sobre una base simple, visible y verificable.
          </p>
        </section>

        <HealthStatus />
      </div>
    </main>
  );
}
