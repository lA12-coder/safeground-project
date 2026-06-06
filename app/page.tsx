'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertCircle, Users, Church, BarChart3, HeartHandshake,
  BookOpen, UserRound, ArrowRight, Sparkles, Lock, Eye,
  Globe, CheckCircle, Star, Activity, Cross, ShieldCheck,
  Sun, Moon, Bell, MessageCircle, PhoneCall, Search, MapPin,
  Award, Target, Compass, Feather, ChevronUp,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';
import { AuthFooterLinks } from '@/components/layout/AuthFooterLinks';
import { FullPageLink } from '@/components/ui/FullPageLink';

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  initial: { opacity: 1, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: easeOut },
};

const fadeIn = {
  initial: { opacity: 1 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 1 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
};

const staggerItem = {
  initial: { opacity: 1, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: easeOut },
};

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const num = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!inView || !num) { setDisplay(value); return; }
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(num / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start + suffix);
    }, duration / 30);
    return () => clearInterval(timer);
  }, [inView, num, value, suffix]);

  return <div ref={ref}>{display}</div>;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <motion.span {...fadeUp} className="text-[10px] font-semibold uppercase tracking-widest text-[#92400E] block">
      {children}
    </motion.span>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <motion.h2
      {...fadeUp}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mt-3 mb-4"
    >
      {children}
    </motion.h2>
  );
}

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
    icon: Shield, title: 'AI Recovery Dashboard',
    desc: 'Personalized healing journeys powered by AI that adapt to your mood, urges, and progress in real-time.',
    span: 'md:col-span-2 md:row-span-2', href: '/register',
    gradient: 'from-[#fdf6ed] to-white',
  },
  {
    icon: AlertCircle, title: 'Panic Support',
    desc: 'One-tap grounding exercises and crisis connection for immediate relief.',
    span: 'md:col-span-1', href: '/panic',
    bgColor: 'bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white',
  },
  {
    icon: Users, title: 'Anonymous Chat',
    desc: 'Peer-to-peer support with full anonymity. Your identity stays protected.',
    span: 'md:col-span-1', href: '/chat',
    bgColor: 'bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white',
  },
  {
    icon: Church, title: 'Faith Integration',
    desc: 'Spiritual resources aligned with Ethiopian Orthodox, Islamic, and Protestant traditions.',
    span: 'md:col-span-2', href: '/spiritual',
    gradient: 'from-[#fdf6ed] to-white',
  },
];

const testimonials = [
  {
    quote: "SafeGround gave me a space where I didn't have to explain my cultural background. The anonymity made me feel brave for the first time.",
    author: 'Student at Addis Ababa University', initials: 'AAU', rating: 5,
  },
  {
    quote: 'The integration of faith-based support with modern therapy was what I needed. It felt whole, not like I was choosing between religion and mental health.',
    author: 'Student at Adama Science & Tech', initials: 'ASTU', rating: 5,
  },
  {
    quote: 'The panic button saved me during a late-night crisis. Within seconds I was breathing through it. I never felt alone.',
    author: 'Student at Jimma University', initials: 'JU', rating: 5,
  },
];

const trustIndicators = [
  { icon: Lock, label: 'Anonymous by Design' },
  { icon: Eye, label: 'No Public Profiles' },
  { icon: Shield, label: 'Local Encryption' },
  { icon: Globe, label: 'Local Language Support' },
];

const approachValues = [
  { icon: Compass, title: 'Evidence-Based Recovery', desc: 'Our approach combines CBT, mindfulness, and culturally-grounded practices proven effective for Ethiopian youth.' },
  { icon: Target, title: 'Trauma-Informed Care', desc: 'Every interaction is designed with sensitivity to past trauma, ensuring a safe healing environment.' },
  { icon: Feather, title: 'Whole-Person Healing', desc: 'We address mental, emotional, social, and spiritual dimensions — honoring the complete human experience.' },
  { icon: Award, title: 'Peer-Led Community', desc: 'Recovery is strengthened through shared experience. Our moderated peer spaces foster accountability without judgment.' },
];

const safeguardingPillars = [
  { icon: Lock, title: 'Zero-Knowledge Architecture', desc: 'We never store passwords, messages are ephemeral, and your identity is protected by 256-bit encryption.' },
  { icon: Shield, title: 'Anonymous by Default', desc: 'No real names, no phone numbers, no device fingerprinting. You exist only as your chosen alias.' },
  { icon: Eye, title: 'Moderated & Safe', desc: 'All community spaces are actively moderated. AI flagging protects against harmful content and abuse.' },
  { icon: Bell, title: '24/7 Crisis Protocol', desc: 'The PANIC button triggers immediate grounding exercises, AI coping support, and optional guardian alerts.' },
];

const helpHubItems = [
  { icon: MessageCircle, title: 'AI Companion Chat', desc: 'Talk to our AI recovery companion anytime. Non-judgmental, always available, completely anonymous.', href: '/guest', color: 'text-[#92400E]', bg: 'bg-[#fdf6ed]' },
  { icon: Users, title: 'Community Rooms', desc: 'Join peer support rooms organized by topic. Share milestones, ask questions, offer encouragement.', href: '/chat', color: 'text-[#16a34a]', bg: 'bg-green-50' },
  { icon: PhoneCall, title: 'Crisis Hotlines', desc: 'Immediate access to Ethiopian crisis helplines and emergency mental health support services.', href: '/panic', color: 'text-[#dc2626]', bg: 'bg-red-50' },
  { icon: Search, title: 'Provider Directory', desc: 'Find verified counselors, psychiatrists, and faith-based programs near your university.', href: '/directory', color: 'text-[#2563eb]', bg: 'bg-blue-50' },
];

function Card({ children, className = '', delay = 0, ...props }: { children: React.ReactNode; className?: string; delay?: number; [key: string]: unknown }) {
  return (
    <motion.div
      variants={staggerItem}
      transition={{ delay }}
      className={`group ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (v) => setVisible(v > 600));
  }, [scrollY]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-[#92400E] text-white shadow-lg hover:bg-[#a04e14] transition-colors flex items-center justify-center"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#92400E]/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-[#d97706]/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
    </div>
  );
}

export default function LandingPage() {
  const [realUsers, setRealUsers] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setRealUsers(d.totalUsers))
      .catch(() => {});
  }, []);

  const realStats = [
    { label: 'Active Students', value: realUsers !== null ? `${realUsers}+` : '—', color: 'text-[#92400E]', desc: 'Across Ethiopian universities' },
    { label: 'Data Sovereignty', value: '100%', color: 'text-[#16a34a]', desc: 'Anonymous by design' },
    { label: 'Crisis Response', value: '24/7', color: 'text-[#2563eb]', desc: 'Always available' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <SiteHeader />
      <BackToTop />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <FloatingOrbs />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdf6ed]/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[520px]">
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pt-16 md:pt-20 pb-10 md:pb-16"
            >
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/10 text-[#16a34a] text-[11px] font-semibold border border-[#16a34a]/20 mb-4"
              >
                <Sparkles size={12} />
                Trusted by 15k+ Ethiopian university students
              </motion.div>
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-bold text-[#2c241f] leading-[1.08] mb-3">
                Your Freedom is{' '}
                <span className="text-[#92400E] italic">Private.</span>
                <br />
                Your Recovery is{' '}
                <span className="bg-gradient-to-r from-[#92400E] to-[#d97706] bg-clip-text text-transparent">Possible.</span>
              </h1>
              <motion.p
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-base md:text-lg text-[#6f5b4e] max-w-md leading-[1.35] mb-5"
              >
                A private, judgment-free platform helping Ethiopian youth break free from pornography addiction — with daily tools, anonymous support, and healing rooted in dignity.
              </motion.p>
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="flex flex-wrap items-center gap-2.5 mb-7"
              >
                <FullPageLink
                  href="/register"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#92400E] text-white font-semibold px-5 py-2.5 rounded-md hover:bg-[#a04e14] transition-all shadow-sm text-sm hover:shadow-md hover:shadow-[#92400E]/20 active:scale-95"
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
              </motion.div>
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex flex-wrap items-center gap-0 divide-x divide-[#e5e0db]"
              >
                {trustIndicators.map((item, i) => (
                  <div key={item.label} className={`flex items-center gap-1.5 px-3 ${i === 0 ? 'pl-0' : ''}`}>
                    <item.icon className="w-3.5 h-3.5 text-[#92400E]" />
                    <span className="text-xs text-[#9a8a7d] font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden md:flex items-center justify-end pt-16 md:pt-20 pb-10 md:pb-16"
            >
              <div className="relative w-full max-w-[520px]">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#92400E]/10 via-[#d97706]/5 to-transparent rounded-2xl blur-2xl pointer-events-none" />
                <img
                  src="/soul-footing.png"
                  alt="A place where the soul finds its footing — SafeGround recovery platform"
                  className="relative w-full h-auto rounded-xl shadow-lg border border-[#e5e0db]"
                  loading="eager"
                />
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-[#ffedd5] rounded-full blur-xl opacity-60 pointer-events-none" />
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#92400E]/10 rounded-full blur-xl opacity-60 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Our Approach</SectionLabel>
            <SectionHeading>Healing Rooted in Dignity & Evidence</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] max-w-2xl mx-auto leading-relaxed">
              SafeGround was built from the ground up for Ethiopian students. Our approach honors the cultural,
              spiritual, and social realities of university life while integrating proven recovery science.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {approachValues.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-[#fafaf9] rounded-xl border border-[#e5e0db] p-6 hover:shadow-lg hover:border-[#92400E]/20 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#fdf6ed] flex items-center justify-center text-[#92400E] mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-[#2c241f] text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* The Challenge */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>The Challenge</SectionLabel>
            <SectionHeading>Many young people struggle silently</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] max-w-xl mx-auto">
              Compulsive behavior, shame cycles, and isolation affect thousands of Ethiopian students. SafeGround helps break the cycle through evidence-based support.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {problems.map((item) => (
              <Card key={item.title} className="bg-white rounded-xl p-5 border border-[#e5e0db]/50 hover:border-[#92400E]/20 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#dc2626] mb-3 group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#2c241f] mb-1 leading-tight">{item.title}</h3>
                <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Platform Preview */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
            <motion.div {...fadeUp}>
              <SectionLabel>Meet SafeGround</SectionLabel>
              <SectionHeading>A place where the soul finds its footing</SectionHeading>
              <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] leading-relaxed mb-5">
                Built for Ethiopian university students, SafeGround combines AI-powered recovery tools,
                anonymous community support, professional counseling, and faith-based programs — all
                protected by zero-knowledge privacy.
              </motion.p>
              <motion.div {...stagger} className="flex flex-wrap gap-2">
                {[
                  { label: 'AI-Powered', color: 'bg-[#fdf6ed] text-[#92400E] border-[#92400E]/20' },
                  { label: 'Anonymous', color: 'bg-green-50 text-[#16a34a] border-[#16a34a]/20' },
                  { label: '24/7 Support', color: 'bg-blue-50 text-[#2563eb] border-[#2563eb]/20' },
                  { label: 'Streak Tracking', color: 'bg-purple-50 text-[#9333ea] border-[#9333ea]/20' },
                  { label: 'Faith-Integrated', color: 'bg-amber-50 text-[#92400E] border-[#92400E]/20' },
                ].map((tag) => (
                  <Card key={tag.label}>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tag.color}`}>
                      {tag.label}
                    </span>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl overflow-hidden border border-[#e5e0db] shadow-lg"
            >
              <img src="/safguard.png" alt="SafeGround platform dashboard preview" className="w-full h-auto" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Safeguarding */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Safeguarding</SectionLabel>
            <SectionHeading>Your Safety is Our Foundation</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] max-w-2xl mx-auto leading-relaxed">
              Every aspect of SafeGround is designed with your privacy and safety as the highest priority.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {safeguardingPillars.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="bg-white rounded-xl border border-[#e5e0db] p-6 hover:shadow-lg hover:border-[#16a34a]/20 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#16a34a] mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-[#2c241f] text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </motion.div>
          <motion.div
            {...fadeUp}
            className="mt-10 bg-gradient-to-r from-[#fdf6ed] to-[#f0f9ee] rounded-xl border border-[#e5e0db] p-6 md:p-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#16a34a]" />
              <span className="text-sm font-semibold text-[#2c241f]">Verified by University Partners</span>
            </div>
            <p className="text-xs text-[#6f5b4e] max-w-xl mx-auto">
              SafeGround undergoes regular security audits and complies with Ethiopian data protection standards.
              Our zero-log policy means we have nothing to share — even if asked.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Help & Support Hub */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Help & Support Hub</SectionLabel>
            <SectionHeading>Support When You Need It Most</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re in crisis, need someone to talk to, or want professional guidance,
              our support hub connects you to the right help — instantly and anonymously.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {helpHubItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <Link
                    href={item.href}
                    className="block bg-[#fafaf9] rounded-xl border border-[#e5e0db] p-6 hover:shadow-lg hover:border-[#92400E]/20 transition-all hover:-translate-y-1 h-full"
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-[#2c241f] text-sm mb-2 group-hover:text-[#92400E] transition-colors">{item.title}</h3>
                    <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.desc}</p>
                  </Link>
                </Card>
              );
            })}
          </motion.div>
          <motion.div {...fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <FullPageLink
              href="/guest"
              className="inline-flex items-center gap-1.5 bg-[#92400E] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#a04e14] transition-all shadow-sm text-sm hover:shadow-md active:scale-95"
            >
              Talk to AI Companion <ArrowRight size={15} />
            </FullPageLink>
            <FullPageLink
              href="/chat"
              className="inline-flex items-center gap-1.5 border border-[#e5e0db] text-[#6f5b4e] font-medium px-6 py-2.5 rounded-md hover:bg-[#f6f5f1] transition-colors text-sm"
            >
              Join Community Chat
            </FullPageLink>
            <FullPageLink
              href="/panic"
              className="inline-flex items-center gap-1.5 bg-[#dc2626] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#b91c1c] transition-all shadow-sm text-sm hover:shadow-md active:scale-95"
            >
              <AlertCircle className="w-3.5 h-3.5" /> Emergency
            </FullPageLink>
          </motion.div>
        </div>
      </motion.section>

      {/* Services */}
      <motion.section {...fadeIn} id="services" className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <SectionLabel>Everything You Need</SectionLabel>
            <SectionHeading>Complete Recovery Platform</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e]">
              Integrated tools designed for every stage of your healing journey.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 3).map(({ icon: Icon, title, desc, href, color, bg }) => (
              <Card key={title}>
                <Link
                  href={href}
                  className="block bg-white rounded-xl border border-[#e5e0db] p-6 hover:shadow-lg hover:border-[#92400E]/20 transition-all hover:-translate-y-1 h-full"
                >
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-[#2c241f] text-sm mb-1">{title}</h3>
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{desc}</p>
                </Link>
              </Card>
            ))}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {services.slice(3).map(({ icon: Icon, title, desc, href, color, bg }) => (
                <Card key={title}>
                  <Link
                    href={href}
                    className="block bg-white rounded-xl border border-[#e5e0db] p-6 hover:shadow-lg hover:border-[#92400E]/20 transition-all hover:-translate-y-1 h-full"
                  >
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color} mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-[#2c241f] text-sm mb-1">{title}</h3>
                    <p className="text-xs text-[#6f5b4e] leading-relaxed">{desc}</p>
                  </Link>
                </Card>
              ))}
              <Card>
                <div className="rounded-xl overflow-hidden border border-[#e5e0db] bg-white h-full">
                  <img src="/health.png" alt="Health dashboard preview" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section {...fadeIn} className="py-16 md:py-24 px-4 md:px-10 bg-white border-y border-[#e5e0db]/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp} className="text-xl md:text-2xl font-serif font-bold text-[#2c241f] text-center mb-10">
            Community Impact in Ethiopia
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-1 rounded-xl overflow-hidden border border-[#e5e0db] bg-white"
            >
              <img src="/organ1.png" alt="Organization impact" className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
              {realStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#fafaf9] rounded-xl border border-[#e5e0db] p-8 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`text-5xl md:text-6xl font-serif font-bold ${stat.color} mb-2`}>
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm font-semibold text-[#2c241f]">{stat.label}</div>
                  <div className="text-xs text-[#9a8a7d] mt-1">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Core Features */}
      <motion.section {...fadeIn} id="features" className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel>Core Features</SectionLabel>
            <SectionHeading>Support Built Around You</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e] max-w-xl">
              Integrated care that respects your privacy, your faith, and your urgent needs.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:auto-rows-[240px]">
            {features.map((feature) => {
              const Icon = feature.icon;
              const gradientClass = feature.gradient ? `bg-gradient-to-br ${feature.gradient}` : '';
              const bgClass = feature.bgColor || `${gradientClass} bg-white border border-[#e5e0db]`;
              const className = `${bgClass} p-6 rounded-xl flex flex-col justify-between ${feature.span} overflow-hidden group relative hover:shadow-xl transition-all`;
              const textClass = feature.bgColor?.includes('text-white') ? 'text-white/90' : 'text-[#6f5b4e]';
              const textTitle = feature.bgColor?.includes('text-white') ? 'text-white' : 'text-[#2c241f]';
              const linkClass = feature.bgColor?.includes('text-white') ? 'text-white/80 hover:text-white' : 'text-[#92400E]';

              return (
                <Card key={feature.title}>
                  <Link href={feature.href} className={`${className} h-full`}>
                    <div>
                      <Icon className={`w-9 h-9 mb-3 transition-transform group-hover:scale-110 ${feature.bgColor?.includes('text-white') ? 'text-white' : 'text-[#92400E]'}`} aria-hidden />
                      <h3 className={`text-lg font-serif font-semibold ${textTitle} mb-1.5`}>{feature.title}</h3>
                      <p className={`text-xs ${textClass} leading-relaxed`}>{feature.desc}</p>
                    </div>
                    <span className={`text-xs font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all ${linkClass}`}>
                      Explore <ArrowRight size={12} />
                    </span>
                  </Link>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section {...fadeIn} id="how-it-works" className="py-20 md:py-28 px-4 md:px-10 bg-white scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Your Journey</SectionLabel>
            <SectionHeading>How SafeGround Works</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e]">Six simple steps to start and sustain your recovery.</motion.p>
          </motion.div>
          <motion.div {...stagger} className="space-y-4">
            {[
              { step: '1', title: 'Create Anonymous Identity', body: 'Register with an email, choose a generated alias like Eagle-Biruk-28 — no real name needed.' },
              { step: '2', title: 'Complete Recovery Setup', body: 'Select your language, triggers, support preference, and recovery goal in a private 5-step onboarding.' },
              { step: '3', title: 'Track Daily Habits', body: 'Log moods, urges, and triggers daily. Watch your recovery streak grow.' },
              { step: '4', title: 'Use Panic Tools During Urges', body: 'Tap the red PANIC button for immediate grounding exercises and AI-guided coping steps.' },
              { step: '5', title: 'Build Recovery Streaks', body: 'Celebrate milestones at 3, 7, 14, 30, 60, and 90 days with streak protection.' },
              { step: '6', title: 'Access Support When Needed', body: 'Join anonymous chat, book a provider, connect with faith programs, or invite a guardian.' },
            ].map((item) => (
              <Card key={item.step} className="flex gap-4 bg-[#fafaf9] border border-[#e5e0db] rounded-xl p-5 hover:border-[#92400E]/20 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#92400E] to-[#d97706] text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-[#2c241f] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#6f5b4e] leading-relaxed">{item.body}</p>
                </div>
              </Card>
            ))}
          </motion.div>
          <motion.div {...fadeUp} className="text-center mt-10">
            <FullPageLink
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#92400E] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#a04e14] transition-all shadow-sm text-sm hover:shadow-md active:scale-95"
            >
              Begin Your Journey <ArrowRight size={15} />
            </FullPageLink>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9] border-y border-[#e5e0db]/50">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Testimonials</SectionLabel>
            <SectionHeading>Voices of Healing</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e]">Real stories from the SafeGround community.</motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <Card key={t.initials} className="bg-white border border-[#e5e0db] rounded-xl p-6 flex flex-col hover:shadow-lg transition-all hover:-translate-y-1">
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
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trusted By */}
      <motion.section {...fadeIn} className="py-16 md:py-20 px-4 md:px-10 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span {...fadeUp} className="text-[10px] font-semibold uppercase tracking-widest text-[#9a8a7d]">Trusted by Leading Institutions</motion.span>
          <motion.div {...stagger} className="flex flex-wrap justify-center items-center gap-10 md:gap-16 mt-8">
            {[
              { name: 'AAU', full: 'Addis Ababa University' },
              { name: 'ASTU', full: 'Adama Science & Tech' },
              { name: 'JU', full: 'Jimma University' },
              { name: 'MU', full: 'Mekelle University' },
              { name: 'HU', full: 'Hawassa University' },
            ].map((uni) => (
              <Card key={uni.name}>
                <div className="text-center">
                  <div className="text-lg font-bold font-serif text-[#2c241f]">{uni.name}</div>
                  <div className="text-[10px] text-[#9a8a7d] mt-0.5">{uni.full}</div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeIn} className="py-20 md:py-28 px-4 md:px-10 bg-gradient-to-br from-[#fdf6ed] to-white border-y border-[#e5e0db]/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#92400E] to-[#d97706] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#92400E]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h2 {...fadeUp} className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f] mb-4">
            Start Your Recovery Today
          </motion.h2>
          <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-sm text-[#6f5b4e] max-w-lg mx-auto mb-8">
            Join thousands of Ethiopian students who have taken the first step toward healing. Completely anonymous, completely private.
          </motion.p>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <FullPageLink
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#92400E] text-white font-semibold px-6 py-2.5 rounded-md hover:bg-[#a04e14] transition-all shadow-sm text-sm hover:shadow-md active:scale-95"
            >
              Create Free Account <ArrowRight size={15} />
            </FullPageLink>
            <FullPageLink
              href="/guest"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#e5e0db] text-[#6f5b4e] font-medium px-6 py-2.5 rounded-md hover:bg-[#f6f5f1] transition-colors text-sm"
            >
              Explore as Guest
            </FullPageLink>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section {...fadeIn} id="faq" className="py-20 md:py-28 px-4 md:px-10 bg-[#fafaf9] scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionLabel>FAQ</SectionLabel>
            <SectionHeading>Privacy & Safety</SectionHeading>
            <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-sm text-[#6f5b4e]">Your trust is our most valuable asset.</motion.p>
          </motion.div>
          <motion.div {...stagger} className="space-y-3">
            {[
              { q: 'Is my identity really anonymous?', a: 'You interact using an encrypted alias. Your legal name and student ID are never required for daily use.' },
              { q: 'Can the university see my data?', a: 'Partners receive only anonymized aggregate reports. Individual logs and chats remain private.' },
              { q: 'What happens in a crisis?', a: 'PANIC connects you to grounding tools and crisis lines. Optional guardian alerts never expose your chat history.' },
              { q: 'Is there a cost to use SafeGround?', a: 'SafeGround is completely free for students. All core features including AI support, chat, and panic tools are available at no cost.' },
            ].map((faq) => (
              <Card key={faq.q}>
                <details className="group bg-white border border-[#e5e0db] rounded-xl overflow-hidden">
                  <summary className="flex justify-between items-center px-5 py-4 font-semibold text-[#2c241f] text-sm cursor-pointer list-none hover:bg-[#f6f5f1] transition-colors">
                    {faq.q}
                    <span className="transition-transform group-open:rotate-180 text-[#92400E] text-xs">▼</span>
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-xs text-[#6f5b4e] leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="about" className="bg-[#2c241f] text-white/80 py-16 px-4 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
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
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Platform</h4>
              <Link href="/#features" className="block text-xs text-white/60 hover:text-white transition-colors">Recovery Tools</Link>
              <Link href="/chat" className="block text-xs text-white/60 hover:text-white transition-colors">Community Chat</Link>
              <Link href="/directory" className="block text-xs text-white/60 hover:text-white transition-colors">Provider Directory</Link>
              <Link href="/spiritual" className="block text-xs text-white/60 hover:text-white transition-colors">Faith Support</Link>
              <Link href="/#how-it-works" className="block text-xs text-white/60 hover:text-white transition-colors">How It Works</Link>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Support</h4>
              <AuthFooterLinks />
              <FullPageLink href="/guest" className="block text-xs text-white/60 hover:text-white transition-colors">Guest Access</FullPageLink>
              <Link href="/settings/guardian" className="block text-xs text-white/60 hover:text-white transition-colors">Guardian Setup</Link>
              <Link href="/panic" className="block text-xs text-white/60 hover:text-white transition-colors">Panic Support</Link>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#d97706]">Privacy</h4>
              <p className="text-xs text-white/60">No Tracking</p>
              <p className="text-xs text-white/60">No Device Fingerprinting</p>
              <p className="text-xs text-white/60">No Public Profiles</p>
              <p className="text-xs text-white/60">Local Encryption</p>
              <p className="text-xs text-white/60">Zero-Log Policy</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-center">
            <p className="text-[10px] text-white/40">SafeGround © 2026 — A secure space for healing.</p>
          </div>
        </div>
      </footer>

      <PrivacyBadges />
    </div>
  );
}
