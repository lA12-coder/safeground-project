'use client'

import { useState, useEffect } from 'react'
import { Shield, Copy, Check, QrCode, Trash2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { GuardianSetupWizard } from './GuardianSetupWizard'

interface GuardianInfo {
  guardian_alias: string
  relationship: string
  monitoring_level: string
  token: string
  access_url: string
  created_at: string
}

export function GuardianDashboard() {
  const [guardian, setGuardian] = useState<GuardianInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showRevoke, setShowRevoke] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  async function handleRevoke() {
    await fetch('/api/guardian/revoke', { method: 'POST' })
    setGuardian(null)
    setShowRevoke(false)
  }

  function handleCopy() {
    if (guardian) {
      navigator.clipboard.writeText(guardian.access_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8 text-center text-on-surface-variant">Loading...</div>
  }

  if (showWizard) {
    return (
      <GuardianSetupWizard
        onComplete={(result) => {
          setGuardian({
            guardian_alias: 'Guardian',
            relationship: 'trusted_friend',
            monitoring_level: 'alert_only',
            token: '',
            access_url: result.url,
            created_at: new Date().toISOString(),
          })
          setShowWizard(false)
        }}
      />
    )
  }

  if (!guardian) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8 text-center">
        <Shield size={40} className="text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-on-surface mb-2">No Guardian Linked</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Choose a trusted person who will support you on your recovery journey.
        </p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:brightness-110 transition-all"
        >
          Link a Guardian
        </button>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-secondary" />
          <div>
            <h3 className="font-semibold text-on-surface">Guardian: {guardian.guardian_alias}</h3>
            <p className="text-sm text-on-surface-variant capitalize">{guardian.relationship}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg p-4 mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">Monitoring Level</span>
          <span className="text-sm font-semibold capitalize">{guardian.monitoring_level.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">Access Link</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="text-primary hover:text-primary/80 transition-colors" title="Copy link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button onClick={() => setShowQR(!showQR)} className="text-primary hover:text-primary/80 transition-colors" title="Show QR">
              <QrCode size={16} />
            </button>
          </div>
        </div>
        {copied && <p className="text-xs text-secondary">Copied to clipboard!</p>}
      </div>

      {showQR && (
        <div className="flex justify-center mb-4">
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30">
            <QRCodeSVG value={guardian.access_url} size={128} />
          </div>
        </div>
      )}

      {showRevoke ? (
        <div className="bg-error/5 border border-error/20 rounded-lg p-4 space-y-3">
          <p className="text-sm text-error font-medium">Revoke guardian access?</p>
          <div className="flex gap-2">
            <button onClick={handleRevoke} className="px-4 py-2 bg-error text-on-error text-sm rounded-lg font-semibold hover:brightness-110">Yes, Revoke</button>
            <button onClick={() => setShowRevoke(false)} className="px-4 py-2 border border-outline-variant/30 text-on-surface-variant text-sm rounded-lg hover:bg-surface-container-low transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowRevoke(true)} className="flex items-center gap-2 text-sm text-error hover:text-error/80 mt-4 transition-colors">
          <Trash2 size={16} /> Revoke Access
        </button>
      )}
    </div>
  )
}
