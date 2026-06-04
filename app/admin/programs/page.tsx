'use client'

export default function AdminProgramsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#92400E]">Programs</h1>
      <p className="text-[#64748B]">Faith-based and clinical program management.</p>
      <div className="grid grid-cols-3 gap-6">
        {['Active Programs', 'Participants', 'Completion'].map(label => (
          <div key={label} className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <p className="text-sm text-[#64748B]">{label}</p>
            <p className="text-3xl font-bold text-[#1c1917] mt-2">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}
