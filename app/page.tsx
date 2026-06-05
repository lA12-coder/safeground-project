import Link from 'next/link';
import { Shield, AlertCircle, Users, Church, BarChart3, HeartHandshake, BookOpen, UserRound, ArrowRight, Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';
import { FullPageLink } from '@/components/ui/FullPageLink';

const stats = [
  { label: 'Active Students Supported', value: '15k+', color: 'text-primary' },
  { label: 'Data Sovereignty & Anonymity', value: '100%', color: 'text-secondary' },
  { label: 'Crisis Response Latency', value: '24/7', color: 'text-tertiary' },
];

const services = [
  {
    icon: BarChart3,
    title: 'Daily Check-in',
    desc: 'Log your mood, track urges, and see your recovery streak grow.',
    href: '/log',
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
  {
    icon: Shield,
    title: 'AI Recovery Paths',
    desc: 'Personalized healing journeys that adapt to your mood and progress.',
    href: '/register',
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
  {
    icon: Users,
    title: 'Anonymous Chat',
    desc: 'Peer support circles moderated by professionals, identity shielded.',
    href: '/chat',
    color: 'text-secondary',
    bg: 'bg-secondary/5',
  },
  {
    icon: AlertCircle,
    title: 'Panic Support',
    desc: 'One-tap grounding exercises and emergency crisis connection.',
    href: '/dashboard',
    color: 'text-tertiary',
    bg: 'bg-tertiary/5',
  },
  {
    icon: Church,
    title: 'Faith Integration',
    desc: 'Spiritual resources aligned with Ethiopian traditions.',
    href: '/spiritual',
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
  {
    icon: HeartHandshake,
    title: 'Provider Directory',
    desc: 'Connect with verified counselors and recovery specialists.',
    href: '/directory',
    color: 'text-secondary',
    bg: 'bg-secondary/5',
  },
  {
    icon: BookOpen,
    title: 'Guest Exploration',
    desc: 'Browse anonymously before creating an account.',
    href: '/guest',
    color: 'text-tertiary',
    bg: 'bg-tertiary/5',
  },
  {
    icon: UserRound,
    title: 'Guardian Connection',
    desc: 'Invite a trusted person to support your journey.',
    href: '/settings/guardian',
    color: 'text-primary',
    bg: 'bg-primary/5',
  },
];

const features = [
  {
    icon: Shield,
    title: 'AI Recovery Paths',
    description: 'Personalized healing journeys that adapt to your mood and progress using localized AI models.',
    span: 'md:col-span-2 md:row-span-2',
    href: '/register',
  },
  {
    icon: AlertCircle,
    title: 'Panic Support',
    description: 'One-tap grounding exercises and emergency connection for immediate crisis management.',
    span: 'md:col-span-1',
    bgColor: 'bg-tertiary text-on-tertiary',
    href: '/dashboard',
  },
  {
    icon: Users,
    title: 'Anonymous Chat',
    description: 'Peer-to-peer support circles moderated by professionals, keeping your identity shielded.',
    span: 'md:col-span-1',
    bgColor: 'bg-secondary-container text-on-secondary-container',
    href: '/chat',
  },
  {
    icon: Church,
    title: 'Faith Integration',
    description: 'Spiritual resources aligned with Ethiopian Orthodox, Islamic, and Protestant traditions.',
    span: 'md:col-span-2',
    href: '/spiritual',
  },
];

const testimonials = [
  {
    quote: "SafeGround gave me a space where I didn't have to explain my cultural background. The anonymity made me feel brave for the first time.",
    author: 'Student at Addis Ababa University',
    initials: 'AAU',
  },
  {
    quote: 'The integration of faith-based support with modern therapy was what I needed. It felt whole, not like I was choosing between religion and mental health.',
    author: 'Student at Adama Science & Tech',
    initials: 'ASTU',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 md:px-12 py-20 md:py-32 bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-8 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold border border-secondary/20">
            <Sparkles size={14} />
            Trusted by 15k+ Ethiopian students
          </div>
          <h1 className="heading-hero">
            Your Journey is <span className="text-primary italic">Private.</span>
            <br />
            Your Healing is Possible.
          </h1>
          <p className="body-lg max-w-2xl mx-auto text-balance">
            A digital hearth for university students in Ethiopia. Secure, anonymous support designed with cultural resonance and total privacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <FullPageLink href="/register" className="btn-primary w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 animate-pulse-glow">
              Start Anonymously <ArrowRight size={18} />
            </FullPageLink>
            <Link href="/#how-it-works" className="btn-secondary w-full sm:w-auto text-center">
              How it Works
            </Link>
            <FullPageLink href="/guest" className="btn-ghost w-full sm:w-auto text-center">
              Browse as Guest
            </FullPageLink>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 md:px-12 bg-surface-container-low scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 animate-fade-in-up">
            <h2 className="label-caps">Everything You Need</h2>
            <h3 className="heading-lg">Complete Recovery Support</h3>
            <p className="body-lg">Integrated tools designed for every stage of your journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
            {services.map(({ icon: Icon, title, desc, href, color, bg }) => (
              <Link key={title} href={href}
                className="group bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 hover:shadow-md hover:border-primary/20 transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color} mb-3`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-semibold text-on-surface text-sm mb-1">{title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              View all services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-20 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="heading-lg text-center animate-fade-in-up">Community Impact in Ethiopia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-stagger">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-8 text-center space-y-4 parchment-glow">
                <div className={`text-5xl font-serif font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-on-surface-variant font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 md:px-12 bg-surface-container-low scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl animate-fade-in-up">
            <h2 className="heading-lg mb-4">Support Built Around You</h2>
            <p className="body-lg">Integrated care that respects your privacy, your faith, and your urgent needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[280px] animate-stagger">
            {features.map((feature) => {
              const Icon = feature.icon;
              const bgClass = feature.bgColor || 'bg-surface-container card';
              const className = `${bgClass} p-8 rounded-lg flex flex-col justify-between ${feature.span} overflow-hidden group relative parchment-glow hover:shadow-md transition-shadow`;
              const inner = (
                <>
                  <div>
                    <Icon className="w-10 h-10 mb-4" aria-hidden />
                    <h3 className="heading-md mb-2">{feature.title}</h3>
                    <p className={`text-sm ${feature.bgColor ? 'opacity-90' : 'text-on-surface-variant'}`}>
                      {feature.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold mt-4 opacity-80 group-hover:opacity-100">
                    Explore →
                  </span>
                </>
              );
              const useFullPage = feature.href === '/register' || feature.href === '/login';
              if (useFullPage) {
                return (
                  <FullPageLink key={feature.title} href={feature.href} className={className}>
                    {inner}
                  </FullPageLink>
                );
              }
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
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-surface scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-10 text-center">
          <h2 className="heading-lg animate-fade-in-up">How SafeGround Works</h2>
          <ol className="text-left space-y-6 animate-stagger">
            {[
              { step: '1', title: 'Create your sanctuary', body: 'Register with email or Google, choose an anonymous alias, and complete a private onboarding.' },
              { step: '2', title: 'Track your rhythm', body: 'Log daily moods and urges. Your streak and patterns stay encrypted and visible only to you.' },
              { step: '3', title: 'Reach support instantly', body: 'Use PANIC for crisis grounding, chat anonymously, or connect with providers and faith resources.' },
            ].map((item) => (
              <li key={item.step} className="card p-6 flex gap-4 parchment-glow">
                <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">{item.title}</h3>
                  <p className="body-md">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <FullPageLink href="/register" className="btn-primary inline-flex items-center gap-2">
            Begin Your Journey <ArrowRight size={18} />
          </FullPageLink>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface-container-low py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="heading-lg text-center animate-fade-in-up">Voices of Healing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger">
            {testimonials.map((testimonial) => (
              <div key={testimonial.initials} className="card p-10 space-y-6 parchment-glow">
                <p className="body-md italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface text-sm">{testimonial.author}</div>
                    <div className="text-xs text-on-surface-variant">Verified Anonymous User</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h4 className="label-caps">Trusted by Leading Institutions</h4>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-70">
            {['AAU', 'ASTU', 'JU', 'MU', 'HU'].map((uni) => (
              <div key={uni} className="heading-md text-on-surface-variant">{uni}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 md:px-12 bg-surface-container-low scroll-mt-24">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center animate-fade-in-up">
            <h2 className="heading-lg mb-4">Privacy & Safety FAQ</h2>
            <p className="body-lg">Your trust is our most valuable asset.</p>
          </div>
          <div className="space-y-4 animate-stagger">
            {[
              { q: 'Is my identity really anonymous?', a: 'You interact using an encrypted alias. Your legal name and student ID are never required for daily use.' },
              { q: 'Can the university see my data?', a: 'Partners receive only anonymized aggregate reports. Individual logs and chats remain private.' },
              { q: 'What happens in a crisis?', a: 'PANIC connects you to grounding tools and crisis lines. Optional guardian alerts never expose your chat history.' },
            ].map((faq) => (
              <details key={faq.q} className="card p-6 cursor-pointer group">
                <summary className="flex justify-between items-center font-semibold text-on-surface list-none">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180 text-primary">▼</span>
                </summary>
                <p className="mt-4 body-md">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-12 px-6 md:px-12 border-t border-outline-variant">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="font-serif font-bold text-2xl text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              SafeGround
            </div>
            <p className="body-md">© 2024 SafeGround. A secure space for healing.</p>
          </div>
          <div className="space-y-3">
            <h4 className="label-caps">Platform</h4>
            <Link href="/services" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">All Services</Link>
            <Link href="/#services" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Quick Access</Link>
            <Link href="/#how-it-works" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">How It Works</Link>
            <Link href="/directory" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Provider Directory</Link>
            <Link href="/chat" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Community Chat</Link>
          </div>
          <div className="space-y-3">
            <h4 className="label-caps">Support</h4>
            <FullPageLink href="/login" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Sign In</FullPageLink>
            <FullPageLink href="/register" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Create Account</FullPageLink>
            <FullPageLink href="/guest" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Guest Access</FullPageLink>
            <Link href="/settings/guardian" className="block text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">Guardian Setup</Link>
          </div>
        </div>
      </footer>

      <PrivacyBadges />
    </div>
  );
}
