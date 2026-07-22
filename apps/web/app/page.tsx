import { EvolutionWorkspace } from '../components/evolution/evolution-workspace';
import { HealthStatus } from '../components/health-status';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,156,255,0.18),_transparent_35%),linear-gradient(180deg,_#050816_0%,_#040611_100%)] text-white">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-7xl flex-col gap-10">
        <EvolutionWorkspace />
        <div className="mx-auto w-full max-w-4xl">
          <HealthStatus />
        </div>
      </div>
    </main>
  );
}
