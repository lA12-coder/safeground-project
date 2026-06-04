'use client';

import Link from 'next/link';
import { Shield, AlertCircle, Users, Church } from 'lucide-react';

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
  },
  {
    icon: AlertCircle,
    title: 'Panic Support',
    description: 'One-tap grounding exercises and emergency connection for immediate crisis management.',
    span: 'md:col-span-1',
    bgColor: 'bg-tertiary text-on-tertiary',
  },
  {
    icon: Users,
    title: 'Anonymous Chat',
    description: 'Peer-to-peer support circles moderated by professionals, keeping your identity shielded.',
    span: 'md:col-span-1',
    bgColor: 'bg-secondary-container text-on-secondary-container',
  },
  {
    icon: Church,
    title: 'Faith Integration',
    description: 'Spiritual resources and support that align with Ethiopian Orthodox, Islamic, and Protestant traditions.',
    span: 'md:col-span-2',
  },
];

const testimonials = [
  {
    quote: "SafeGround gave me a space where I didn't have to explain my cultural background. They already knew how hard it was to speak up, and the anonymity made me feel brave for the first time.",
    author: 'Student at Addis Ababa University',
    initials: 'AAU',
  },
  {
    quote: "The integration of faith-based support with modern therapy was what I needed. It felt whole, not like I was choosing between my religion and my mental health.",
    author: 'Student at Adama Science & Tech',
    initials: 'ASTU',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md">
        <nav className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-2xl font-serif font-bold text-primary">SafeGround</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-primary font-semibold border-b-2 border-primary">Recovery</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors">Community</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors">Telehealth</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors">Faith Support</a>
          </div>
          <button className="bg-error text-on-error font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all active:scale-95">
            PANIC
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex flex-col items-center justify-center text-center px-6 md:px-12 py-24 bg-surface">
        <div className="max-w-2xl space-y-8 z-10">
          <h1 className="heading-hero">
            Your Journey is <span className="text-primary italic">Private.</span>
            <br />
            Your Healing is Possible.
          </h1>
          <p className="body-lg max-w-xl mx-auto">
            A digital hearth for university students in Ethiopia. Secure, anonymous support designed with cultural resonance and total privacy.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="btn-primary">
              Start Anonymously
            </Link>
            <button className="btn-secondary">
              How it Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface-container-low py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-16">
          <h2 className="heading-lg text-center">Community Impact in Ethiopia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-8 text-center space-y-4 parchment-glow">
                <div className={`text-5xl font-serif font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-on-surface-variant font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <h2 className="heading-lg mb-4">Support Built Around You</h2>
            <p className="body-lg">Integrated care that respects your privacy, your faith, and your urgent needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const bgClass = feature.bgColor || 'bg-surface-container card';
              
              return (
                <div
                  key={idx}
                  className={`${bgClass} p-8 rounded-lg flex flex-col justify-between ${feature.span} overflow-hidden group relative parchment-glow`}
                >
                  <div className="relative z-10">
                    <Icon className="w-10 h-10 mb-4" />
                    <h3 className="heading-md mb-2">{feature.title}</h3>
                    <p className={`text-sm ${feature.bgColor ? 'opacity-90' : 'text-on-surface-variant'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-surface-container-low py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-16">
          <h2 className="heading-lg text-center">Voices of Healing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="card p-10 space-y-6 parchment-glow">
                <p className="body-md italic">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-on-surface text-sm">{testimonial.author}</div>
                    <div className="text-xs text-on-surface-variant">Verified Anonymous User</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h4 className="label-caps">Trusted by Leading Institutions</h4>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 hover:opacity-100 transition-opacity">
            {['AAU', 'ASTU', 'JU', 'MU', 'HU'].map((uni) => (
              <div key={uni} className="heading-md text-on-surface-variant">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="heading-lg mb-4">Privacy & Safety FAQ</h2>
            <p className="body-lg">Your trust is our most valuable asset.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Is my identity really anonymous?',
                a: 'Yes. We use zero-knowledge architecture. This means we don\'t store your real name or university ID on our servers. You interact using a unique encrypted alias.',
              },
              {
                q: 'Can the university see my data?',
                a: 'Absolutely not. While universities partner with us to provide the service, they only receive anonymized, aggregated impact reports. Individual data is strictly private.',
              },
              {
                q: 'What happens in a crisis?',
                a: 'Our PANIC system connects you with immediate support resources. You remain anonymous, but your safety is our priority. We provide crisis hotlines, grounding techniques, and direct connection to certified counselors.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="card p-6 cursor-pointer group">
                <summary className="flex justify-between items-center font-semibold text-on-surface">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 body-md text-on-surface-variant">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-12 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="font-serif font-bold text-2xl text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              SafeGround
            </div>
            <p className="body-md">© 2024 SafeGround. A secure space for healing.</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              Mission Statement
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              University Partnerships
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              Support Helpdesk
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
              Privacy Policy
            </a>
          </div>
          <div className="space-y-4">
            <h4 className="label-caps">Global Reach</h4>
            <p className="body-md">Currently providing sanctuary to over 15,000 students across the horn of Africa and beyond.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
