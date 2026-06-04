'use client'

export default function AdminRecoveryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#92400E]">Recovery Analytics</h1>
      <p className="text-[#64748B]">Aggregate recovery metrics and program outcomes.</p>
      <div className="grid grid-cols-3 gap-6">
        {['Avg Streak', 'Completion Rate', 'Active Programs'].map(label => (
          <div key={label} className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <p className="text-sm text-[#64748B]">{label}</p>
            <p className="text-3xl font-bold text-[#1c1917] mt-2">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}
