'use client'

import { useState } from 'react'
import { Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react'

interface GuardianSetupWizardProps {
  onComplete: (result: { token: string; access_url: string }) => void
  onCancel: () => void
}

export function GuardianSetupWizard({ onComplete, onCancel }: GuardianSetupWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    guardian_alias: '',
    relationship: 'trusted_friend',
    monitoring_level: 'alert_only',
    notify_on_panic: true,
    notify_on_relapse: false,
    notify_streak_break: false,
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  async function createGuardian() {
    setLoading(true)
    try {
      const res = await fetch('/api/guardian/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        onComplete(data)
      }
    } catch (e) {
      console.error('Failed to create guardian:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-on-surface">Guardian Setup</h2>
        <span className="text-sm text-on-surface-variant">Step {step} of 3</span>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-surface-container-high'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-on-surface mb-1 block">Guardian Name/Alias</label>
            <input
              value={form.guardian_alias}
              onChange={e => update('guardian_alias', e.target.value)}
              placeholder="e.g. Mom, Biruk, Sister"
              className="w-full p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-on-surface mb-1 block">Relationship</label>
            <select
              value={form.relationship}
              onChange={e => update('relationship', e.target.value)}
              className="w-full p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low text-on-surface"
            >
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="spouse">Spouse</option>
              <option value="mentor">Mentor</option>
              <option value="trusted_friend">Trusted Friend</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-on-surface mb-2 block">Monitoring Level</label>
            <div className="space-y-2">
              {[
                { value: 'alert_only', label: 'Alert Only', desc: 'Only notified during crises' },
                { value: 'weekly_summary', label: 'Weekly Summary', desc: 'Receive weekly progress summaries' },
                { value: 'full_view', label: 'Full View', desc: 'See dashboard with mood trends' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('monitoring_level', opt.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    form.monitoring_level === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-outline-variant/30 hover:border-outline bg-surface-container-low'
                  }`}
                >
                  <span className="font-medium text-sm text-on-surface">{opt.label}</span>
                  <span className="text-xs text-on-surface-variant ml-2">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-on-surface">Alert Triggers</label>
            {[
              { field: 'notify_on_panic', label: 'Notify on panic' },
              { field: 'notify_on_relapse', label: 'Notify on relapse' },
              { field: 'notify_streak_break', label: 'Streak breaks' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={(form as any)[field]}
                  onChange={e => update(field, e.target.checked)}
                  className="rounded border-outline-variant/30"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check size={28} className="text-primary" />
          </div>
          <p className="text-on-surface">
            Share this private link with your guardian. They will see your recovery progress and mood trends.
          </p>
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="text-xs text-on-surface-variant mb-2">Pre-written message:</p>
            <p className="text-sm text-on-surface-variant italic">
              &ldquo;I&apos;m working on something important for my wellbeing.
              I&apos;ve given you a private link to support me. Thank you.&rdquo;
            </p>
          </div>
          <button
            onClick={createGuardian}
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading ? 'Generating...' : 'Generate Guardian Link'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/30">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button onClick={onCancel} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
        )}
        {step < 3 && (
          <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
