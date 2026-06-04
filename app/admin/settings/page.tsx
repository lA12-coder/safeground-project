'use client'

import { useEffect, useState } from 'react'
import { Shield, Mail, ToggleLeft } from 'lucide-react'

export default function AdminSettingsPage() {
  const [adminEmails, setAdminEmails] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/metrics')
        if (res.ok) {
          const data = await res.json()
          setAdminEmails(data.admin_emails || process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'Configured via ADMIN_EMAILS env')
        }
      } catch {
        setAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'Configured via ADMIN_EMAILS env')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Settings</h1>
        <p className="text-on-surface-variant mt-1">Platform configuration and admin user management.</p>
      </div>

      <div className="card p-6 max-w-lg space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-surface-container-high">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-on-surface">Admin Emails</label>
            <p className="text-sm text-on-surface-variant mt-1">
              {loading ? (
                <span className="inline-block w-48 h-4 bg-surface-container-high rounded animate-pulse" />
              ) : adminEmails || 'Configured via ADMIN_EMAILS environment variable'}
            </p>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Set via <code className="text-primary bg-surface-container-high px-1 rounded">ADMIN_EMAILS</code> environment variable
            </p>
          </div>
        </div>

        <div className="border-t border-outline-variant/30 pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-surface-container-high">
              <ToggleLeft className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-on-surface">Feature Toggles</label>
              <p className="text-xs text-on-surface-variant mt-1 mb-3">Toggle platform features on or off.</p>
              <div className="space-y-3">
                {['Guardian Access', 'Chat Rooms', 'Telehealth', 'Faith Programs'].map(f => (
                  <label key={f} className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-on-surface">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
