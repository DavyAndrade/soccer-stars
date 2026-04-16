'use client';

import { useRouter } from 'next/navigation';
import { House, LayoutDashboard, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CareerNavProps {
  slot: 1 | 2 | 3;
  current: 'hub' | 'team';
  teamPrimary?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(63, 63, 70, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CareerNav({ slot, current, teamPrimary = '#3f3f46' }: CareerNavProps) {
  const router = useRouter();
  const desktopStyle = {
    borderColor: hexToRgba(teamPrimary, 0.38),
  };
  const mobileStyle = {
    borderTopColor: hexToRgba(teamPrimary, 0.38),
  };

  return (
    <>
      <aside
        className="fixed top-8 bottom-8 left-8 z-40 hidden w-64 flex-col gap-2 overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 shadow-sm md:flex"
        style={desktopStyle}
      >
        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Modo carreira</p>

        <Button
          className="justify-start gap-2 md:h-12 md:px-4 md:text-base"
          variant={current === 'hub' ? 'default' : 'outline'}
          onClick={() => router.push(`/carreira?slot=${slot}`)}
        >
          <LayoutDashboard className="h-4 w-4" />
          Carreira
        </Button>

        <Button
          className="justify-start gap-2 md:h-12 md:px-4 md:text-base"
          variant={current === 'team' ? 'default' : 'outline'}
          onClick={() => router.push(`/carreira/time?slot=${slot}`)}
        >
          <Shield className="h-4 w-4" />
          Time
        </Button>

        <Button className="justify-start gap-2 md:h-12 md:px-4 md:text-base" variant="outline" onClick={() => router.push(`/partida?slot=${slot}`)}>
          <Swords className="h-4 w-4" />
          Partida
        </Button>

        <Button className="justify-start gap-2 md:h-12 md:px-4 md:text-base" variant="outline" onClick={() => router.push('/')}>
          <House className="h-4 w-4" />
          Menu Inicial
        </Button>
      </aside>

      <nav
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden"
        style={mobileStyle}
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2">
          <Button
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            variant={current === 'hub' ? 'default' : 'outline'}
            onClick={() => router.push(`/carreira?slot=${slot}`)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Carreira
          </Button>
          <Button
            size="sm"
            className="h-auto flex-col gap-1 py-2"
            variant={current === 'team' ? 'default' : 'outline'}
            onClick={() => router.push(`/carreira/time?slot=${slot}`)}
          >
            <Shield className="h-4 w-4" />
            Time
          </Button>
          <Button size="sm" className="h-auto flex-col gap-1 py-2" variant="outline" onClick={() => router.push(`/partida?slot=${slot}`)}>
            <Swords className="h-4 w-4" />
            Partida
          </Button>
          <Button size="sm" className="h-auto flex-col gap-1 py-2" variant="outline" onClick={() => router.push('/')}>
            <House className="h-4 w-4" />
            Menu
          </Button>
        </div>
      </nav>
    </>
  );
}
