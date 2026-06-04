'use client'

export default function AdminCommunityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#92400E]">Community Overview</h1>
      <p className="text-[#64748B]">Anonymous chat rooms, active users, and engagement metrics.</p>
      <div className="grid grid-cols-3 gap-6">
        {[{ label: 'Active Today', value: '—' }, { label: 'Messages Today', value: '—' }, { label: 'Flagged', value: '—' }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <p className="text-sm text-[#64748B]">{s.label}</p>
            <p className="text-3xl font-bold text-[#1c1917] mt-2">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
