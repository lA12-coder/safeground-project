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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Guardian Setup</h2>
        <span className="text-sm text-gray-400">Step {step} of 3</span>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-amber-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Guardian Name/Alias</label>
            <input
              value={form.guardian_alias}
              onChange={e => update('guardian_alias', e.target.value)}
              placeholder="e.g. Mom, Biruk, Sister"
              className="w-full p-3 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Relationship</label>
            <select
              value={form.relationship}
              onChange={e => update('relationship', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">Monitoring Level</label>
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
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-gray-700">Alert Triggers</label>
            {[
              { field: 'notify_on_panic', label: 'Notify on panic' },
              { field: 'notify_on_relapse', label: 'Notify on relapse' },
              { field: 'notify_streak_break', label: 'Streak breaks' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={(form as any)[field]}
                  onChange={e => update(field, e.target.checked)}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Check size={28} className="text-amber-600" />
          </div>
          <p className="text-gray-700">
            Share this private link with your guardian. They will see your recovery progress and mood trends.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Pre-written message:</p>
            <p className="text-sm text-gray-600 italic">
              &ldquo;I&apos;m working on something important for my wellbeing.
              I&apos;ve given you a private link to support me. Thank you.&rdquo;
            </p>
          </div>
          <button
            onClick={createGuardian}
            disabled={loading}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Guardian Link'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        )}
        {step < 3 && (
          <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
