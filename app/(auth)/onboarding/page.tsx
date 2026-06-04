'use client';

import { useState, useActionState } from 'react';
import { Users, Lock } from 'lucide-react';
import { completeOnboarding, type AuthActionResult } from '@/lib/auth/actions';

const languages = [
  { code: 'en', name: 'English', icon: '🌍', script: 'Primary Interface' },
  { code: 'am', name: 'አማርኛ', icon: '🌍', script: 'Amharic' },
  { code: 'om', name: 'Oromifa', icon: '🌍', script: 'Afaan Oromoo' },
  { code: 'ti', name: 'ትግርኛ', icon: '🚩', script: 'Tigrinya' },
];

const triggers = [
  { id: 'stress', label: 'Stress', icon: '⚡' },
  { id: 'boredom', label: 'Boredom', icon: '😐' },
  { id: 'late-night', label: 'Late Night', icon: '🌙' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'peer-pressure', label: 'Peer Pressure', icon: '👥' },
  { id: 'loneliness', label: 'Loneliness', icon: '😔' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴' },
  { id: 'post-khat', label: 'Post-Khat Crash', icon: '📉' },
  { id: 'after-alcohol', label: 'After Alcohol', icon: '🍷' },
];

const supportModes = [
  { id: 'secular', label: 'Secular', description: 'Focus on science-backed habits and mindfulness techniques.' },
  { id: 'faith', label: 'Faith-based', description: 'Integrate spiritual guidance and traditional Ethiopian faith support.' },
  { id: 'clinical', label: 'Clinical', description: 'Direct access to certified recovery specialists and therapists.' },
];

const initialState: AuthActionResult = {};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSupport, setSelectedSupport] = useState('secular');
  const [guardianOptIn, setGuardianOptIn] = useState<boolean | null>(null);
  const [goal, setGoal] = useState('');
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);

  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(triggerId) ? prev.filter((t) => t !== triggerId) : [...prev, triggerId]
    );
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center px-6 md:px-12 py-12">
        <div className="max-w-2xl w-full space-y-12">
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="label-caps">Onboarding Journey</label>
              <span className="text-2xl font-serif font-bold text-on-surface-variant">{step} / 5</span>
            </div>
            <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-secondary transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="card p-8 md:p-12 space-y-10 parchment-glow min-h-[500px] flex flex-col justify-between">
            {/* Step 1: Language */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="heading-md">Choose your heart's language</h2>
                  <p className="body-lg">Healing starts with being understood. Select the language you're most comfortable with.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:border-primary bg-surface-container-lowest'
                      }`}
                    >
                      <div className="font-serif font-bold text-xl mb-1">{lang.name}</div>
                      <div className="text-on-surface-variant text-sm">{lang.script}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Triggers */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="heading-md">Identify your triggers</h2>
                  <p className="body-lg">What brings you to this hearth today? Selecting these helps us protect your peace.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {triggers.map((trigger) => (
                    <button
                      key={trigger.id}
                      onClick={() => handleTriggerToggle(trigger.id)}
                      className={`chip ${selectedTriggers.includes(trigger.id) ? 'chip-active' : 'chip-inactive'}`}
                    >
                      {trigger.icon} {trigger.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Support Preference */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="heading-md">Your path to recovery</h2>
                  <p className="body-lg">How would you like to be supported? We offer various lenses for healing.</p>
                </div>
                <div className="space-y-4">
                  {supportModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedSupport(mode.id)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        selectedSupport === mode.id
                          ? 'border-secondary bg-secondary-container/20'
                          : 'border-outline-variant hover:border-secondary bg-surface-container-lowest'
                      }`}
                    >
                      <div className="font-serif font-bold text-xl mb-2">{mode.label}</div>
                      <div className="text-on-surface-variant text-sm">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Guardian */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="heading-md">Privacy is our bond</h2>
                  <p className="body-lg">SafeGround is built on complete anonymity. We don't ask for your name, phone, or location. You are a guest in our sanctuary.</p>
                  <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-primary space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Lock className="w-5 h-5" />
                      <span className="font-semibold">Privacy-First Policy</span>
                    </div>
                    <p className="body-md text-on-surface-variant">
                      Your 'Guardian' is a peer mentor who only sees your progress, never your identity. Would you like to be paired with one?
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGuardianOptIn(true)}
                    className={`flex-1 p-4 rounded-full font-semibold transition-all ${
                      guardianOptIn === true ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-low text-on-surface hover:bg-outline-variant/20'
                    }`}
                  >
                    Yes, Pair Me
                  </button>
                  <button
                    onClick={() => setGuardianOptIn(false)}
                    className={`flex-1 p-4 rounded-full font-semibold border-2 transition-all ${
                      guardianOptIn === false ? 'border-primary bg-primary/5' : 'border-outline-variant'
                    }`}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Goals */}
            {step === 5 && (
              <div className="space-y-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-tertiary-container rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-on-tertiary" />
                  </div>
                  <h2 className="heading-md">Welcome to SafeGround</h2>
                  <p className="body-lg text-on-surface-variant">
                    What is your primary goal for the next 30 days?
                  </p>
                </div>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Reach 7 days of peace"
                  className="w-full p-6 bg-surface-container-low border-2 border-outline-variant rounded-lg text-center font-serif text-2xl placeholder:text-outline-variant focus:outline-none focus:border-secondary"
                />
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className="px-4 py-2 bg-secondary-container/30 text-on-secondary-container rounded-full text-xs font-semibold">
                    #HealingJourney
                  </span>
                  <span className="px-4 py-2 bg-secondary-container/30 text-on-secondary-container rounded-full text-xs font-semibold">
                    #AddictionRecovery
                  </span>
                </div>
              </div>
            )}

            {state.error && (
              <p className="text-sm text-error" role="alert">
                {state.error}
              </p>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4 pt-8 border-t border-outline-variant">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1}
                className="text-on-surface-variant font-semibold hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                {step === 5 ? (
                  <form action={formAction} className="inline">
                    <input type="hidden" name="language" value={selectedLanguage} />
                    <input type="hidden" name="support_mode" value={selectedSupport} />
                    <input
                      type="hidden"
                      name="guardian_opt_in"
                      value={guardianOptIn === true ? 'true' : 'false'}
                    />
                    <input type="hidden" name="recovery_goal" value={goal} />
                    {selectedTriggers.map((t) => (
                      <input key={t} type="hidden" name="triggers" value={t} />
                    ))}
                    <button
                      type="submit"
                      disabled={pending}
                      className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {pending ? 'Saving…' : 'Enter the Sanctuary'}
                      <span>→</span>
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    Continue
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Zero-log architecture</p>
          </div>
        </div>
    </main>
  );
}
