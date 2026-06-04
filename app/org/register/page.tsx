'use client'

import { useState } from 'react'
import { Building2, Users, ClipboardList, Upload, CheckCircle } from 'lucide-react'

const orgTypes = [
  { value: 'ngo', label: 'NGO' },
  { value: 'religious_org', label: 'Religious Org' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'university', label: 'University' },
]

const servicesOffered = [
  'Counseling', 'Support Groups', 'Crisis Intervention',
  'Recovery Programs', 'Spiritual Guidance', 'Education & Outreach',
]

const languages = ['Amharic', 'English', 'Oromifa', 'Tigrinya', 'Somali']

export default function OrgRegistrationPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    org_name: '', org_type: '', reg_number: '', country: 'Ethiopia', city: '',
    contact_name: '', contact_email: '', contact_phone: '', contact_role: '',
    services: [] as string[], languages: [] as string[],
    online: false, in_person: true, pro_bono: false, fee_structure: '',
  })

  const totalSteps = 4

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  function toggleArray(field: 'services' | 'languages', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.contact_name,
          org_name: form.org_name,
          type: form.org_type,
          city: form.city,
          region: form.country,
          bio: `Registered ${form.org_type} organization providing ${form.services.join(', ')}.`,
          languages: form.languages,
          online: form.online,
          in_person: form.in_person,
          pro_bono: form.pro_bono,
          consultation_fee: form.fee_structure ? parseInt(form.fee_structure) : null,
          is_verified: false,
          is_active: false,
        }),
      })

      if (res.ok) setSubmitted(true)
    } catch (e) {
      console.error('Submission failed:', e)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-12 max-w-lg text-center">
          <CheckCircle size={48} className="text-[#166534] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1c1917] mb-2">Registration Submitted</h1>
          <p className="text-[#64748B] mb-6">
            Your organization has been registered. Our admin team will review and verify your account within 2-3 business days.
          </p>
          <a href="/" className="text-[#92400E] font-semibold hover:text-[#78350F]">Return to SafeGround →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Building2 size={32} className="text-[#92400E] mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-[#92400E]">Organization Registration</h1>
          <p className="text-[#64748B] mt-1">Join SafeGround as a verified support provider</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s <= step ? 'bg-[#92400E] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 rounded ${s < step ? 'bg-[#92400E]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-[#92400E]" />
                <h2 className="text-lg font-semibold">Organization Information</h2>
              </div>
              <input
                placeholder="Organization Name"
                value={form.org_name}
                onChange={e => update('org_name', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.org_type}
                  onChange={e => update('org_type', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                >
                  <option value="">Organization Type</option>
                  {orgTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input
                  placeholder="Registration Number"
                  value={form.reg_number}
                  onChange={e => update('reg_number', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Country"
                  value={form.country}
                  onChange={e => update('country', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-[#92400E]" />
                <h2 className="text-lg font-semibold">Contact &amp; Leadership</h2>
              </div>
              <input
                placeholder="Primary Contact Name"
                value={form.contact_name}
                onChange={e => update('contact_name', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Contact Email"
                  value={form.contact_email}
                  onChange={e => update('contact_email', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                />
                <input
                  placeholder="Contact Phone"
                  value={form.contact_phone}
                  onChange={e => update('contact_phone', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                />
              </div>
              <input
                placeholder="Role/Title"
                value={form.contact_role}
                onChange={e => update('contact_role', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={18} className="text-[#92400E]" />
                <h2 className="text-lg font-semibold">Service Details</h2>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Services Offered</label>
                <div className="grid grid-cols-2 gap-2">
                  {servicesOffered.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleArray('services', s)}
                      className={`p-2 rounded-lg text-sm border transition-colors ${
                        form.services.includes(s)
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <button
                      key={l}
                      onClick={() => toggleArray('languages', l)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        form.languages.includes(l)
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.online} onChange={e => update('online', e.target.checked)} />
                  <span className="text-sm">Online</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.in_person} onChange={e => update('in_person', e.target.checked)} />
                  <span className="text-sm">In-person</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.pro_bono} onChange={e => update('pro_bono', e.target.checked)} />
                  <span className="text-sm">Pro-bono</span>
                </label>
              </div>
              <input
                placeholder="Fee structure (e.g. '100 USD/session' or leave blank if pro-bono)"
                value={form.fee_structure}
                onChange={e => update('fee_structure', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={18} className="text-[#92400E]" />
                <h2 className="text-lg font-semibold">Verification Documents</h2>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Upload registration certificate and credentials</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG</p>
                <button className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Choose Files
                </button>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">Review your information before submitting</p>
                <p className="text-xs text-amber-600 mt-1">You will receive a confirmation email once submitted</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                Previous
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 bg-[#92400E] text-white rounded-lg font-semibold hover:bg-[#78350F]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#166534] text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
