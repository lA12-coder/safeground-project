import Link from 'next/link'
import { Shield, User, Bell, Lock, ChevronRight, Sparkles } from 'lucide-react'

const sections = [
  { icon: Sparkles, label: 'AI Plus', desc: '20 free AI requests, then upgrade for unlimited', href: '/settings/subscription' },
  { icon: User, label: 'Profile', desc: 'Alias, language, recovery preferences', href: '/settings/guardian' },
  { icon: Shield, label: 'Guardian', desc: 'Manage guardian link and permissions', href: '/settings/guardian' },
  { icon: Bell, label: 'Notifications', desc: 'Alert preferences and frequency', href: '/settings/guardian' },
  { icon: Lock, label: 'Privacy', desc: 'Data controls and session management', href: '/settings/guardian' },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#2c241f] mb-1">Settings</h1>
        <p className="text-sm text-[#6f5b4e] mb-8">Manage your account and preferences</p>
        <div className="space-y-2">
          {sections.map(({ icon: Icon, label, desc, href }) => (
            <Link key={label} href={href}
              className="flex items-center gap-4 bg-white rounded-lg border border-[#e5e0db] p-4 hover:shadow-sm hover:border-[#d4c9be] transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#f0ece7] flex items-center justify-center text-[#8a3d08]">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#2c241f]">{label}</div>
                <div className="text-xs text-[#6f5b4e]">{desc}</div>
              </div>
              <ChevronRight size={16} className="text-[#9a8a7d] group-hover:text-[#8a3d08] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
