'use client'

import { GuardianDashboard } from '@/components/guardian/GuardianDashboard'

export default function GuardianSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guardian Link</h1>
        <p className="text-gray-500 mt-1">
          Connect a trusted person who can support your recovery journey
        </p>
      </div>
      <GuardianDashboard />
    </div>
  )
}
