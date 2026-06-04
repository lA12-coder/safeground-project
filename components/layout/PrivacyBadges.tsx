import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

const badges = [
  { icon: Lock, label: 'Local Encryption' },
  { icon: ShieldCheck, label: 'Zero-Log Policy' },
  { icon: KeyRound, label: 'Private Keys' },
] as const;

export function PrivacyBadges() {
  return (
    <section className="bg-surface-container-highest py-12 px-6 md:px-12 border-t border-outline-variant">
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          {badges.map(({ icon: Icon, label }) => (
            <div key={label} className="space-y-3">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant mx-auto">
                <Icon className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <span className="text-xs font-semibold text-on-surface block">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
