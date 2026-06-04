'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ChevronLeft, ChevronRight, Church } from 'lucide-react';
import type {
  CreateGuardianPayload,
  GuardianRelationship,
  MonitoringLevel,
} from '@/lib/guardian/types';

const RELATIONSHIPS: GuardianRelationship[] = [
  'Parent',
  'Sibling',
  'Spouse',
  'Mentor',
  'Trusted Friend',
];

const MONITORING_LEVELS: MonitoringLevel[] = [
  'Alert Only',
  'Weekly Summary',
  'Full View',
];

type GuardianSetupWizardProps = {
  onComplete: (result: { url: string; shareText: string }) => void;
};

export function GuardianSetupWizard({ onComplete }: GuardianSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [alias, setAlias] = useState('');
  const [relationship, setRelationship] = useState<GuardianRelationship>('Parent');
  const [monitoringLevel, setMonitoringLevel] = useState<MonitoringLevel>('Alert Only');
  const [notifyPanic, setNotifyPanic] = useState(true);
  const [notifyRelapse, setNotifyRelapse] = useState(false);
  const [notifyStreakBreak, setNotifyStreakBreak] = useState(false);
  const [url, setUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLink = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateGuardianPayload = {
        alias,
        relationship,
        monitoringLevel,
        notifyPanic,
        notifyRelapse,
        notifyStreakBreak,
      };
      const res = await fetch('/api/guardian/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not create link.');
        return;
      }
      const linkUrl = data.url ?? data.access_url;
      const text = data.shareText ?? '';
      setUrl(linkUrl);
      setShareText(text);
      setStep(3);
      onComplete({ url: linkUrl, shareText: text });
    } finally {
      setSubmitting(false);
    }
  };

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareText || url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-8 space-y-8 parchment-glow">
      <p className="text-sm text-on-surface-variant">
        Step {step} of 3 — invite someone you trust without sharing chat or habit logs.
      </p>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="guardian-alias" className="label-caps block mb-2">
              Guardian alias
            </label>
            <input
              id="guardian-alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. Mom, Brother Sam…"
              className="input-field"
            />
          </div>
          <div>
            <span className="label-caps block mb-3">Relationship</span>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRelationship(r)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
                    relationship === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <span className="label-caps block mb-3">Monitoring level</span>
            <div className="space-y-2">
              {MONITORING_LEVELS.map((level) => (
                <label
                  key={level}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer ${
                    monitoringLevel === level
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="monitoring"
                    checked={monitoringLevel === level}
                    onChange={() => setMonitoringLevel(level)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-on-surface">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyPanic}
                onChange={(e) => setNotifyPanic(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-medium">Notify on panic (recommended)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyRelapse}
                onChange={(e) => setNotifyRelapse(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-medium">Notify on relapse</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyStreakBreak}
                onChange={(e) => setNotifyStreakBreak(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-medium">Notify on streak breaks</span>
            </label>
          </div>
        </div>
      )}

      {step === 3 && url && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="p-4 bg-white rounded-xl border border-outline-variant">
              <QRCodeSVG value={url} size={160} level="M" />
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="label-caps block mb-2">Private link</label>
                <input readOnly value={url} className="input-field text-sm" />
              </div>
              <button
                type="button"
                onClick={copyShare}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy link & message'}
              </button>
            </div>
          </div>
          {shareText && (
            <div className="bg-surface-container-low rounded-lg p-4 text-sm text-on-surface-variant leading-relaxed italic">
              {shareText}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-between pt-4 border-t border-outline-variant">
        {step > 1 && step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-on-surface-variant font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <span />
        )}
        {step === 1 && (
          <button
            type="button"
            disabled={!alias.trim()}
            onClick={() => setStep(2)}
            className="btn-primary py-2 px-6 disabled:opacity-50 flex items-center gap-1 ml-auto"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            disabled={submitting}
            onClick={createLink}
            className="btn-primary py-2 px-6 disabled:opacity-50 flex items-center gap-2 ml-auto"
          >
            <Church className="w-4 h-4" />
            {submitting ? 'Creating…' : 'Generate link'}
          </button>
        )}
        {step === 3 && (
          <button type="button" onClick={copyShare} className="btn-primary py-2 px-6 ml-auto">
            Done
          </button>
        )}
      </div>
    </div>
  );
}
