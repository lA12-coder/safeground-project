'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Users } from 'lucide-react';
import type { GuardianLink } from '@/lib/guardian/types';
import { RevokeGuardianModal } from './RevokeGuardianModal';

type GuardianStatusCardProps = {
  guardian: GuardianLink;
  url: string;
  shareText: string;
  onRevoked: () => void;
};

export function GuardianStatusCard({
  guardian,
  url,
  shareText,
  onRevoked,
}: GuardianStatusCardProps) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      const res = await fetch('/api/guardian/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: guardian.id }),
      });
      if (res.ok) {
        setRevokeOpen(false);
        onRevoked();
      }
    } finally {
      setRevoking(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="card p-8 space-y-6 parchment-glow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-on-surface">{guardian.alias}</h2>
            <p className="text-sm text-on-surface-variant">
              {guardian.relationship} · {guardian.monitoringLevel}
            </p>
          </div>
        </div>

        <ul className="text-sm text-on-surface-variant space-y-1">
          <li>{guardian.notifyPanic ? '✓' : '○'} Panic alerts</li>
          <li>{guardian.notifyRelapse ? '✓' : '○'} Relapse alerts</li>
          <li>{guardian.notifyStreakBreak ? '✓' : '○'} Streak break alerts</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-6 items-center p-4 bg-surface-container-low rounded-lg">
          <QRCodeSVG value={url} size={120} level="M" />
          <div className="flex-1 w-full space-y-2">
            <input readOnly value={url} className="input-field text-xs" />
            <button
              type="button"
              onClick={copyLink}
              className="btn-secondary w-full flex items-center justify-center gap-2 mt-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy share message
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRevokeOpen(true)}
          className="w-full py-3 rounded-full border-2 border-error text-error font-semibold hover:bg-error/5"
        >
          Revoke Access
        </button>
      </div>

      <RevokeGuardianModal
        alias={guardian.alias}
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={handleRevoke}
        revoking={revoking}
      />
    </>
  );
}
