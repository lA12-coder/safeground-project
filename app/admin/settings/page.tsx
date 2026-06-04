'use client'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#92400E]">Admin Settings</h1>
      <p className="text-[#64748B]">Platform configuration and admin user management.</p>
      <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1c1917]/80">Admin Emails</label>
            <input className="w-full p-3 border border-[#d6d3d1] rounded-lg mt-1" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Feature Toggles</label>
            <div className="space-y-2 mt-2">
              {['Guardian Access', 'Chat Rooms', 'Telehealth', 'Faith Programs'].map(f => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {f}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
