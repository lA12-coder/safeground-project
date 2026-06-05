import Link from 'next/link';
import { Shield, AlertCircle, Users, Church, BarChart3, HeartHandshake, BookOpen, UserRound, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';
import { FullPageLink } from '@/components/ui/FullPageLink';

const services = [
  {
    icon: BarChart3,
    title: 'Daily Check-in',
    desc: 'Log your mood, track urges, and see your recovery streak grow. Private daily journals with encrypted storage.',
    href: '/log',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    features: ['Mood & urge tracking', 'Streak calendar', 'Progress charts', 'Encrypted journal'],
  },
  {
    icon: Shield,
    title: 'AI Recovery Paths',
    desc: 'Personalized healing journeys that adapt to your mood and progress using localized AI models.',
    href: '/register',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    features: ['Adaptive learning', 'Localized for Ethiopia', 'Privacy-first AI', '24/7 availability'],
  },
  {
    icon: Users,
    title: 'Anonymous Chat',
    desc: 'Peer support circles moderated by professionals, keeping your identity shielded at all times.',
    href: '/chat',
    color: 'text-green-700',
    bg: 'bg-green-50',
    features: ['Alias-based identity', 'Moderated rooms', 'Peer support', 'Professional oversight'],
  },
  {
    icon: AlertCircle,
    title: 'Panic Support',
    desc: 'One-tap grounding exercises and emergency crisis connection when you need immediate help.',
    href: '/dashboard',
    color: 'text-red-700',
    bg: 'bg-red-50',
    features: ['One-tap activation', 'Grounding exercises', 'Crisis hotline', 'Guardian alert'],
  },
  {
    icon: Church,
    title: 'Faith Integration',
    desc: 'Spiritual resources aligned with Ethiopian Orthodox, Islamic, and Protestant traditions.',
    href: '/spiritual',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    features: ['Multi-faith support', 'Scripture references', 'Prayer prompts', 'Faith counselor network'],
  },
  {
    icon: HeartHandshake,
    title: 'Provider Directory',
    desc: 'Connect with verified counselors, psychiatrists, and recovery specialists across Ethiopia.',
    href: '/directory',
    color: 'text-green-700',
    bg: 'bg-green-50',
    features: ['Verified providers', 'Filter by city/language', 'Telehealth ready', 'Pro bono options'],
  },
  {
    icon: BookOpen,
    title: 'Guest Exploration',
    desc: 'Browse the platform anonymously before creating an account. Full privacy, zero commitment.',
    href: '/guest',
    color: 'text-red-700',
    bg: 'bg-red-50',
    features: ['No sign-up needed', 'Full guest chat', 'Anonymous session', 'Rate-limited safety'],
  },
  {
    icon: UserRound,
    title: 'Guardian Connection',
    desc: 'Invite a trusted person to support your recovery journey with your consent and control.',
    href: '/settings/guardian',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    features: ['Trusted support person', 'Token-gated access', 'Progress sharing', 'Encouragement tools'],
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <SiteHeader />

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#166534]/10 text-[#166534] text-xs font-semibold border border-[#166534]/20">
              <Sparkles size={14} />
              Complete Recovery Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2c241f]">Everything You Need</h1>
            <p className="text-lg text-[#6f5b4e]">Integrated tools designed for every stage of your recovery journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {services.map(({ icon: Icon, title, desc, href, color, bg, features }) => (
              <Link key={title} href={href}
                className="group bg-white rounded-xl border border-[#e5e0db] shadow-sm p-6 hover:shadow-md hover:border-[#92400E]/30 transition-all hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} mb-4`}>
                  <Icon size={22} />
                </div>
                <h2 className="text-lg font-bold text-[#2c241f] mb-2">{title}</h2>
                <p className="text-sm text-[#6f5b4e] leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#6f5b4e]">
                      <CheckCircle size={12} className="text-[#166534] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#92400E] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-8">
            <p className="text-sm text-[#6f5b4e] mb-6">Ready to start your healing journey?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <FullPageLink href="/register" className="px-8 py-4 bg-[#92400E] text-white rounded-full font-semibold hover:bg-[#a04e14] transition-all flex items-center gap-2">
                Create Free Account <ArrowRight size={18} />
              </FullPageLink>
              <FullPageLink href="/guest" className="px-8 py-4 border-2 border-[#166534] text-[#166534] rounded-full font-semibold hover:bg-[#166534]/5 transition-all">
                Browse as Guest
              </FullPageLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#e5e0db] py-12 px-6 md:px-12 border-t border-[#d4c9be]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-[#6f5b4e]">© 2024 SafeGround. A secure space for healing.</p>
        </div>
      </footer>

      <PrivacyBadges />
    </div>
  )
}
