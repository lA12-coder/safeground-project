'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { GuardianSetupWizard } from './GuardianSetupWizard';
import { GuardianStatusCard } from './GuardianStatusCard';
import type { GuardianLink } from '@/lib/guardian/types';
import { guardianShareText } from '@/lib/guardian/share';

export function GuardianSettings() {
  const [guardian, setGuardian] = useState<GuardianLink | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guardian/status');
      const data = await res.json();
      if (data.guardian) {
        setGuardian(data.guardian);
        setUrl(data.url ?? '');
      } else {
        setGuardian(null);
        setUrl('');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const shareText = url ? guardianShareText(url) : '';

  return (
    <div className="page-shell">
      <div className="page-content max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-8 hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="dashboard-page-title">Guardian Circle</h1>
        </div>
        <p className="dashboard-page-subtitle mb-8">
          Invite someone you trust with a private link. They receive only the alerts you choose —
          never your chat history or habit logs.
        </p>

        {loading ? (
          <p className="text-on-surface-variant">Loading…</p>
        ) : guardian && url ? (
          <GuardianStatusCard
            guardian={guardian}
            url={url}
            shareText={shareText}
            onRevoked={loadStatus}
          />
        ) : (
          <GuardianSetupWizard
            onComplete={() => {
              loadStatus();
            }}
          />
        )}
      </div>
    </div>
  );
}
