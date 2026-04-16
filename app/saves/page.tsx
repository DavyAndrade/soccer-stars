import { SavesClient } from './saves-client';

type Mode = 'new' | 'continue';

interface SavesPageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function SavesPage({ searchParams }: SavesPageProps) {
  const params = await searchParams;
  const mode: Mode = params.mode === 'continue' ? 'continue' : 'new';

  return <SavesClient mode={mode} />;
}
