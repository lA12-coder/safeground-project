import Link from 'next/link';
import { Shield, AlertCircle, Users, Church } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';
import { FullPageLink } from '@/components/ui/FullPageLink';

const stats = [
  { label: 'Active Students Supported', value: '15k+', color: 'text-primary' },
  { label: 'Data Sovereignty & Anonymity', value: '100%', color: 'text-secondary' },
  { label: 'Crisis Response Latency', value: '24/7', color: 'text-tertiary' },
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
    quote:
      "SafeGround gave me a space where I didn't have to explain my cultural background. The anonymity made me feel brave for the first time.",
    author: 'Student at Addis Ababa University',
    initials: 'AAU',
  },
  {
    quote:
      'The integration of faith-based support with modern therapy was what I needed. It felt whole, not like I was choosing between religion and mental health.',
    author: 'Student at Adama Science & Tech',
    initials: 'ASTU',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <section className="relative min-h-[560px] flex flex-col items-center justify-center text-center px-6 md:px-12 py-20 bg-surface">
        <div className="max-w-2xl space-y-8 z-10">
          <h1 className="heading-hero">
            Your Journey is <span className="text-primary italic">Private.</span>
            <br />
            Your Healing is Possible.
          </h1>
          <p className="body-lg max-w-xl mx-auto">
            A digital hearth for university students in Ethiopia. Secure, anonymous support designed with cultural resonance and total privacy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <FullPageLink href="/register" className="btn-primary w-full sm:w-auto text-center">
              Start Anonymously
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

      <section className="bg-surface-container-low py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="heading-lg text-center">Community Impact in Ethiopia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-8 text-center space-y-4 parchment-glow">
                <div className={`text-5xl font-serif font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-on-surface-variant font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 md:px-12 scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <h2 className="heading-lg mb-4">Support Built Around You</h2>
            <p className="body-lg">Integrated care that respects your privacy, your faith, and your urgent needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[280px]">
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

      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-surface-container-low scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-10 text-center">
          <h2 className="heading-lg">How SafeGround Works</h2>
          <ol className="text-left space-y-6">
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
          <FullPageLink href="/register" className="btn-primary inline-block">
            Begin Your Journey
          </FullPageLink>
        </div>
      </section>

      <section className="bg-surface-container-low py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="heading-lg text-center">Voices of Healing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <section className="py-16 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h4 className="label-caps">Trusted by Leading Institutions</h4>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-70">
            {['AAU', 'ASTU', 'JU', 'MU', 'HU'].map((uni) => (
              <div key={uni} className="heading-md text-on-surface-variant">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-6 md:px-12 bg-surface-container-low scroll-mt-24">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="heading-lg mb-4">Privacy & Safety FAQ</h2>
            <p className="body-lg">Your trust is our most valuable asset.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Is my identity really anonymous?',
                a: 'You interact using an encrypted alias. Your legal name and student ID are never required for daily use.',
              },
              {
                q: 'Can the university see my data?',
                a: 'Partners receive only anonymized aggregate reports. Individual logs and chats remain private.',
              },
              {
                q: 'What happens in a crisis?',
                a: 'PANIC connects you to grounding tools and crisis lines. Optional guardian alerts never expose your chat history.',
              },
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

      <footer className="bg-surface-container-highest py-12 px-6 md:px-12 border-t border-outline-variant">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="font-serif font-bold text-2xl text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              SafeGround
            </div>
            <p className="body-md">© 2024 SafeGround. A secure space for healing.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/#how-it-works" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              How It Works
            </Link>
            <Link href="/directory" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              University Partnerships
            </Link>
            <FullPageLink href="/login" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              Support Helpdesk
            </FullPageLink>
            <FullPageLink href="/register" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              Privacy & Registration
            </FullPageLink>
          </div>
          <div className="space-y-4">
            <h4 className="label-caps">Get Started</h4>
            <div className="flex flex-col gap-2">
              <FullPageLink href="/register" className="btn-primary text-center text-sm py-3">
                Create Account
              </FullPageLink>
              <FullPageLink href="/login" className="btn-secondary text-center text-sm py-3">
                Sign In
              </FullPageLink>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyBadges />
    </div>
  );
}
