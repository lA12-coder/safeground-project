'use client';

import { Shield } from 'lucide-react';

type FeatureItem = {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  desc: string;
};

type AuthLeftPanelProps = {
  headline: string;
  subtitle: string;
  features: FeatureItem[];
};

export function AuthLeftPanel({ headline, subtitle, features }: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 bg-[#7B2D00] w-full min-h-full p-10 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 mb-6">
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield className="w-[18px] h-[18px] text-white" />
          </div>
          <span
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#fff', fontWeight: 600 }}
          >
            SafeGround
          </span>
        </div>

        {/* Centered content */}
        <div className="flex flex-col justify-center flex-1 overflow-hidden">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              lineHeight: '1.2',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              fontSize: '13.5px',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: '1.6',
              marginTop: '10px',
              maxWidth: '260px',
            }}
          >
            {subtitle}
          </p>

          <div className="space-y-4" style={{ marginTop: '24px' }}>
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start" style={{ gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: '16px', height: '16px', color: '#FFD4A8' }} />
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', marginTop: '2px' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="shrink-0"
          style={{
            background: 'rgba(255,255,255,0.10)',
            borderRadius: '12px',
            padding: '18px',
          }}
        >
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '24px',
              color: 'rgba(255,255,255,0.3)',
              lineHeight: '0.8',
              marginBottom: '4px',
            }}
          >
            &ldquo;
          </p>
          <p
            style={{
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.88)',
              lineHeight: '1.6',
              marginBottom: '12px',
            }}
          >
            SafeGround gave me a space where I didn't have to explain myself. That privacy changed everything.
          </p>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.55)' }}>
              Student, Addis Ababa University
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, ri) => (
                <svg key={ri} width="9" height="9" viewBox="0 0 24 24" fill="#F5A623">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}