import Link from 'next/link';
import { Shield } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function GuardianViewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="card p-10 max-w-md w-full text-center space-y-6 parchment-glow">
        <Shield className="w-10 h-10 text-primary mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-on-surface">Guardian Support View</h1>
        <p className="body-md text-sm">
          {token
            ? 'You have been invited to support someone on their recovery journey. Alert preferences are managed by them — this view will show summaries when enabled.'
            : 'This link is missing a token. Ask the person who shared it to send a new invite.'}
        </p>
        <Link href="/" className="btn-primary inline-block py-3 px-8">
          Learn about SafeGround
        </Link>
      </div>
    </div>
  );
}
