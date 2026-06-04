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
    return <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-400">Loading...</div>
  }

  if (showWizard) {
    return (
      <GuardianSetupWizard
        onComplete={(result) => {
          setGuardian({
            guardian_alias: 'Guardian',
            relationship: 'trusted_friend',
            monitoring_level: 'alert_only',
            token: result.token,
            access_url: result.access_url ?? `${window.location.origin}/guardian/${result.token}`,
            created_at: new Date().toISOString(),
          })
          setShowWizard(false)
        }}
        onCancel={() => setShowWizard(false)}
      />
    )
  }

  if (!guardian) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <Shield size={40} className="text-amber-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Guardian Linked</h3>
        <p className="text-sm text-gray-500 mb-6">
          Choose a trusted person who will support you on your recovery journey.
        </p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
        >
          Link a Guardian
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Guardian: {guardian.guardian_alias}</h3>
            <p className="text-sm text-gray-500 capitalize">{guardian.relationship}</p>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monitoring Level</span>
          <span className="text-sm font-semibold capitalize">{guardian.monitoring_level.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Access Link</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="text-amber-600 hover:text-amber-700" title="Copy link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button onClick={() => setShowQR(!showQR)} className="text-amber-600 hover:text-amber-700" title="Show QR">
              <QrCode size={16} />
            </button>
          </div>
        </div>
        {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}
      </div>

      {showQR && (
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <QRCodeSVG value={guardian.access_url} size={128} />
          </div>
        </div>
      )}

      {showRevoke ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-red-700 font-medium">Revoke guardian access?</p>
          <div className="flex gap-2">
            <button onClick={handleRevoke} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold">Yes, Revoke</button>
            <button onClick={() => setShowRevoke(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowRevoke(true)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 mt-4">
          <Trash2 size={16} /> Revoke Access
        </button>
      )}
    </div>
  )
}
