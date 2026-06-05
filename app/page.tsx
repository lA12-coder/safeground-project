import Link from 'next/link';
import {
  Shield, AlertCircle, Users, Church, BarChart3, HeartHandshake,
  BookOpen, UserRound, ArrowRight, Sparkles, Lock, Eye,
  Globe, CheckCircle, Star, Activity, Cross,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';
import { FullPageLink } from '@/components/ui/FullPageLink';

const stats = [
  { label: 'Active Students', value: '15k+', color: 'text-[#92400E]', desc: 'Across Ethiopian universities' },
  { label: 'Data Sovereignty', value: '100%', color: 'text-[#16a34a]', desc: 'Anonymous by design' },
  { label: 'Crisis Response', value: '24/7', color: 'text-[#2563eb]', desc: 'Always available' },
];

const problems = [
  { icon: AlertCircle, title: 'Compulsive pornography use', desc: 'Silent struggle affecting academic and personal life' },
  { icon: AlertCircle, title: 'Shame cycles & isolation', desc: 'Fear of judgment preventing students from seeking help' },
  { icon: AlertCircle, title: 'Khat-related impulse spikes', desc: 'Substance use triggering relapse patterns' },
  { icon: AlertCircle, title: 'Anxiety & stress', desc: 'Academic pressure compounding recovery challenges' },
];

const services = [
  { icon: BarChart3, title: 'AI Recovery Dashboard', desc: 'Track urges, mood, habits, and recovery progress with smart insights.', href: '/dashboard', color: 'text-[#92400E]', bg: 'bg-[#fdf6ed]' },
  { icon: Shield, title: 'Panic Button', desc: 'Immediate intervention during high-risk moments with breathing exercises.', href: '/panic', color: 'text-[#dc2626]', bg: 'bg-red-50' },
  { icon: Users, title: 'Anonymous Support Rooms', desc: 'Talk to peers without revealing your identity in moderated spaces.', href: '/chat', color: 'text-[#16a34a]', bg: 'bg-green-50' },
  { icon: UserRound, title: 'Professional Directory', desc: 'Connect with verified counselors and psychiatrists.', href: '/directory', color: 'text-[#2563eb]', bg: 'bg-blue-50' },
  { icon: Church, title: 'Faith Support', desc: 'Join trusted faith-based recovery programs aligned with Ethiopian traditions.', href: '/spiritual', color: 'text-[#92400E]', bg: 'bg-[#fdf6ed]' },
  { icon: HeartHandshake, title: 'Guardian Support', desc: 'Invite a trusted person to support your journey anonymously.', href: '/settings/guardian', color: 'text-[#9333ea]', bg: 'bg-purple-50' },
];

const features = [
  {
    icon: Shield,
    title: 'AI Recovery Dashboard',
    desc: 'Personalized healing journeys powered by AI that adapt to your mood, urges, and progress in real-time.',
    span: 'md:col-span-2 md:row-span-2',
    href: '/register',
    gradient: 'from-[#fdf6ed] to-white',
  },
  {
    icon: AlertCircle,
    title: 'Panic Support',
    desc: 'One-tap grounding exercises and crisis connection for immediate relief.',
    span: 'md:col-span-1',
    bgColor: 'bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white',
    href: '/panic',
  },
  {
    icon: Users,
    title: 'Anonymous Chat',
    desc: 'Peer-to-peer support with full anonymity. Your identity stays protected.',
    span: 'md:col-span-1',
    bgColor: 'bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white',
    href: '/chat',
  },
  {
    icon: Church,
    title: 'Faith Integration',
    desc: 'Spiritual resources aligned with Ethiopian Orthodox, Islamic, and Protestant traditions.',
    span: 'md:col-span-2',
    href: '/spiritual',
    gradient: 'from-[#fdf6ed] to-white',
  },
];

const testimonials = [
  {
    quote: "SafeGround gave me a space where I didn't have to explain my cultural background. The anonymity made me feel brave for the first time.",
    author: 'Student at Addis Ababa University',
    initials: 'AAU',
    rating: 5,
  },
  {
    quote: 'The integration of faith-based support with modern therapy was what I needed. It felt whole, not like I was choosing between religion and mental health.',
    author: 'Student at Adama Science & Tech',
    initials: 'ASTU',
    rating: 5,
  },
  {
    quote: 'The panic button saved me during a late-night crisis. Within seconds I was breathing through it. I never felt alone.',
    author: 'Student at Jimma University',
    initials: 'JU',
    rating: 5,
  },
];

const trustIndicators = [
  { icon: Lock, label: 'Anonymous by Design' },
  { icon: Eye, label: 'No Public Profiles' },
  { icon: Shield, label: 'Local Encryption' },
  { icon: Globe, label: 'Local Language Support' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdf6ed]/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#92400E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-10">
          <div className="grid md:grid-cols-2 gap-10 items-center min-h-[520px]">
            <div className="pt-16 md:pt-20 pb-10 md:pb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/10 text-[#16a34a] text-[11px] font-semibold border border-[#16a34a]/20 mb-4">
                <Sparkles size={12} />
                Trusted by 15k+ Ethiopian university students
              </div>
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-bold text-[#2c241f] leading-[1.08] mb-3">
                Your Journey is{' '}
                <span className="text-[#92400E] italic">Private.</span>
                <br />
                Your Healing is{' '}
                <span className="bg-gradient-to-r from-[#92400E] to-[#d97706] bg-clip-text text-transparent">Possible.</span>
              </h1>
              <p className="text-base md:text-lg text-[#6f5b4e] max-w-md leading-[1.35] mb-5">
                A private, judgment-free space for Ethiopian youth seeking support for recovery, digital well-being, and healing.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mb-7">
                <FullPageLink
                  href="/register"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#92400E] text-white font-semibold px-5 py-2.5 rounded-md hover:bg-[#a04e14] transition-colors shadow-sm text-sm"
                >
                  Start Anonymously <ArrowRight size={15} />
                </FullPageLink>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center gap-1.5 border border-[#e5e0db] text-[#6f5b4e] font-medium px-5 py-2.5 rounded-md hover:bg-[#f6f5f1] transition-colors text-sm"
                >
                  How it Works
                </Link>
                <FullPageLink
                  href="/guest"
                  className="inline-flex items-center justify-center gap-1.5 text-[#6f5b4e] font-medium px-3 py-2.5 rounded-md hover:bg-[#f6f5f1] transition-colors text-sm"
                >
                  Continue as Guest
                </FullPageLink>
              </div>
              <div className="flex flex-wrap items-center gap-0 divide-x divide-[#e5e0db]">
                {trustIndicators.map((item, i) => (
                  <div key={item.label} className={`flex items-center gap-1.5 px-3 ${i === 0 ? 'pl-0' : ''}`}>
                    <item.icon className="w-3.5 h-3.5 text-[#92400E]" />
                    <span className="text-xs text-[#9a8a7d] font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block relative h-[480px] rounded-xl overflow-hidden bg-gradient-to-br from-[#fdf6ed] to-white">
              <img
                src="/hero-illustration.svg"
                alt="SafeGround recovery illustration"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c241f]/20 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <p className="text-xs font-semibold text-[#2c241f]">Begin your journey</p>
                  <p className="text-[10px] text-[#6f5b4e]">Private recovery support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-20 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">The Challenge</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">
              Many young people struggle silently
            </h2>
            <p className="text-sm text-[#6f5b4e] max-w-xl mx-auto">
              Compulsive behavior, shame cycles, and isolation affect thousands of Ethiopian students. SafeGround helps break the cycle through evidence-based support.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {problems.map((item) => (
              <div key={item.title} className="bg-[#f6f5f1] rounded-lg p-4 border border-[#e5e0db]/50 hover:border-[#92400E]/20 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#dc2626] mb-2.5">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-[#2c241f] mb-0.5 leading-tight">{item.title}</h3>
                <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 md:py-20 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">Everything You Need</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">
              Complete Recovery Platform
            </h2>
            <p className="text-sm text-[#6f5b4e]">
              Integrated tools designed for every stage of your healing journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map(({ icon: Icon, title, desc, href, color, bg }) => (
              <Link
                key={title}
                href={href}
                className="group bg-white rounded-lg border border-[#e5e0db] p-5 hover:shadow-sm hover:border-[#92400E]/20 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color} mb-3`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-[#2c241f] text-sm mb-1">{title}</h3>
                <p className="text-xs text-[#6f5b4e] leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#2c241f] text-center mb-8">
            Community Impact in Ethiopia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#fafaf9] rounded-lg border border-[#e5e0db] p-6 text-center hover:shadow-sm transition-shadow">
                <div className={`text-4xl md:text-5xl font-serif font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm font-semibold text-[#2c241f]">{stat.label}</div>
                <div className="text-xs text-[#9a8a7d] mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-20 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">Core Features</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">
              Support Built Around You
            </h2>
            <p className="text-sm text-[#6f5b4e] max-w-xl">
              Integrated care that respects your privacy, your faith, and your urgent needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[240px]">
            {features.map((feature) => {
              const Icon = feature.icon;
              const gradientClass = feature.gradient ? `bg-gradient-to-br ${feature.gradient}` : '';
              const bgClass = feature.bgColor || `${gradientClass} bg-white border border-[#e5e0db]`;
              const className = `${bgClass} p-6 rounded-lg flex flex-col justify-between ${feature.span} overflow-hidden group relative hover:shadow-md transition-all`;
              const textClass = feature.bgColor?.includes('text-white') ? 'text-white/90' : 'text-[#6f5b4e]';
              const textTitle = feature.bgColor?.includes('text-white') ? 'text-white' : 'text-[#2c241f]';
              const linkClass = feature.bgColor?.includes('text-white') ? 'text-white/80 hover:text-white' : 'text-[#92400E]';

              const inner = (
                <>
                  <div>
                    <Icon className={`w-9 h-9 mb-3 ${feature.bgColor?.includes('text-white') ? 'text-white' : 'text-[#92400E]'}`} aria-hidden />
                    <h3 className={`text-lg font-serif font-semibold ${textTitle} mb-1.5`}>{feature.title}</h3>
                    <p className={`text-xs ${textClass} leading-relaxed`}>{feature.desc}</p>
                  </div>
                  <span className={`text-xs font-semibold mt-3 flex items-center gap-1 group-hover:gap-1.5 transition-all ${linkClass}`}>
                    Explore <ArrowRight size={12} />
                  </span>
                </>
              );

              return (
                <Link key={feature.title} href={feature.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 md:px-10 bg-white scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">Your Journey</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">How SafeGround Works</h2>
            <p className="text-sm text-[#6f5b4e]">Six simple steps to start and sustain your recovery.</p>
          </div>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Create Anonymous Identity', body: 'Register with an email, choose a generated alias like Eagle-Biruk-28 — no real name needed.' },
              { step: '2', title: 'Complete Recovery Setup', body: 'Select your language, triggers, support preference, and recovery goal in a private 5-step onboarding.' },
              { step: '3', title: 'Track Daily Habits', body: 'Log moods, urges, and triggers daily. Watch your recovery streak grow.' },
              { step: '4', title: 'Use Panic Tools During Urges', body: 'Tap the red PANIC button for immediate grounding exercises and AI-guided coping steps.' },
              { step: '5', title: 'Build Recovery Streaks', body: 'Celebrate milestones at 3, 7, 14, 30, 60, and 90 days with streak protection.' },
              { step: '6', title: 'Access Support When Needed', body: 'Join anonymous chat, book a provider, connect with faith programs, or invite a guardian.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 bg-[#fafaf9] border border-[#e5e0db] rounded-lg p-4 hover:border-[#92400E]/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#92400E] to-[#d97706] text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-[#2c241f] text-sm mb-0.5">{item.title}</h3>
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <FullPageLink
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#92400E] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#a04e14] transition-colors shadow-sm text-sm"
            >
              Begin Your Journey <ArrowRight size={15} />
            </FullPageLink>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 px-4 md:px-10 bg-[#fafaf9] border-y border-[#e5e0db]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">Testimonials</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">Voices of Healing</h2>
            <p className="text-sm text-[#6f5b4e]">Real stories from the SafeGround community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.initials} className="bg-white border border-[#e5e0db] rounded-lg p-5 flex flex-col hover:shadow-sm transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#d97706] text-[#d97706]" />
                  ))}
                </div>
                <p className="text-xs text-[#6f5b4e] italic leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-[#e5e0db]/50">
                  <div className="w-9 h-9 rounded-full bg-[#fdf6ed] flex items-center justify-center text-[#92400E] font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2c241f]">{t.author}</p>
                    <p className="text-[10px] text-[#9a8a7d]">Verified Anonymous User</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 px-4 md:px-10 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9a8a7d]">Trusted by Leading Institutions</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 mt-6">
            {[
              { name: 'AAU', full: 'Addis Ababa University' },
              { name: 'ASTU', full: 'Adama Science & Tech' },
              { name: 'JU', full: 'Jimma University' },
              { name: 'MU', full: 'Mekelle University' },
              { name: 'HU', full: 'Hawassa University' },
            ].map((uni) => (
              <div key={uni.name} className="text-center">
                <div className="text-lg font-bold font-serif text-[#2c241f]">{uni.name}</div>
                <div className="text-[10px] text-[#9a8a7d] mt-0.5">{uni.full}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 md:px-10 bg-gradient-to-br from-[#fdf6ed] to-white border-y border-[#e5e0db]/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#92400E] to-[#d97706] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#92400E]/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mb-3">
            Start Your Recovery Today
          </h2>
          <p className="text-sm text-[#6f5b4e] max-w-lg mx-auto mb-6">
            Join thousands of Ethiopian students who have taken the first step toward healing. Completely anonymous, completely private.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <FullPageLink
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#92400E] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#a04e14] transition-colors shadow-sm text-sm"
            >
              Create Free Account <ArrowRight size={15} />
            </FullPageLink>
            <FullPageLink
              href="/guest"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#e5e0db] text-[#6f5b4e] font-medium px-6 py-2.5 rounded-md hover:bg-[#f6f5f1] transition-colors text-sm"
            >
              Explore as Guest
            </FullPageLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E]">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-2 mb-3">Privacy & Safety</h2>
            <p className="text-sm text-[#6f5b4e]">Your trust is our most valuable asset.</p>
          </div>
          <div className="space-y-2">
            {[
              { q: 'Is my identity really anonymous?', a: 'You interact using an encrypted alias. Your legal name and student ID are never required for daily use.' },
              { q: 'Can the university see my data?', a: 'Partners receive only anonymized aggregate reports. Individual logs and chats remain private.' },
              { q: 'What happens in a crisis?', a: 'PANIC connects you to grounding tools and crisis lines. Optional guardian alerts never expose your chat history.' },
              { q: 'Is there a cost to use SafeGround?', a: 'SafeGround is completely free for students. All core features including AI support, chat, and panic tools are available at no cost.' },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white border border-[#e5e0db] rounded-lg overflow-hidden">
                <summary className="flex justify-between items-center px-4 py-3 font-semibold text-[#2c241f] text-sm cursor-pointer list-none hover:bg-[#f6f5f1] transition-colors">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180 text-[#92400E] text-xs">▼</span>
                </summary>
                <div className="px-4 pb-3">
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-[#2c241f] text-white/80 py-12 px-4 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#d97706]" />
                <span className="font-serif font-bold text-lg text-white">SafeGround</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                A private, judgment-free recovery platform for Ethiopian university students.
              </p>
              <div className="flex gap-2 pt-1">
                {[Shield, Lock, Eye].map((Icon, i) => (
                  <div key={i} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Platform</h4>
              <Link href="/#features" className="block text-xs text-white/60 hover:text-white transition-colors">Recovery Tools</Link>
              <Link href="/chat" className="block text-xs text-white/60 hover:text-white transition-colors">Community Chat</Link>
              <Link href="/directory" className="block text-xs text-white/60 hover:text-white transition-colors">Provider Directory</Link>
              <Link href="/spiritual" className="block text-xs text-white/60 hover:text-white transition-colors">Faith Support</Link>
              <Link href="/#how-it-works" className="block text-xs text-white/60 hover:text-white transition-colors">How It Works</Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Support</h4>
              <FullPageLink href="/register" className="block text-xs text-white/60 hover:text-white transition-colors">Create Account</FullPageLink>
              <FullPageLink href="/login" className="block text-xs text-white/60 hover:text-white transition-colors">Sign In</FullPageLink>
              <FullPageLink href="/guest" className="block text-xs text-white/60 hover:text-white transition-colors">Guest Access</FullPageLink>
              <Link href="/settings/guardian" className="block text-xs text-white/60 hover:text-white transition-colors">Guardian Setup</Link>
              <Link href="/panic" className="block text-xs text-white/60 hover:text-white transition-colors">Panic Support</Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Privacy</h4>
              <p className="text-xs text-white/60">No Tracking</p>
              <p className="text-xs text-white/60">No Device Fingerprinting</p>
              <p className="text-xs text-white/60">No Public Profiles</p>
              <p className="text-xs text-white/60">Local Encryption</p>
              <p className="text-xs text-white/60">Zero-Log Policy</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-[10px] text-white/40">SafeGround © 2026 — A secure space for healing.</p>
          </div>
        </div>
      </footer>

      <PrivacyBadges />
    </div>
  );
}
