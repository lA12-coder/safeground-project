import Link from 'next/link';
import { Shield, Heart, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-primary">SafeGround</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-brand-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-darker transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">Your Safe Space for Digital Well-being</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A privacy-first platform designed for Ethiopian university students to support mental health, connection, and personal growth.
        </p>
        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/guest"
            className="inline-block px-8 py-3 border-2 border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary/10 transition-colors"
          >
            Visit as Guest
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why SafeGround?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Privacy */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-brand-primary" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete Privacy</h4>
              <p className="text-gray-600 text-sm">
                Anonymous aliases and end-to-end encrypted communications
              </p>
            </div>

            {/* Mental Health */}
            <div className="text-center">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="text-success" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mental Health Support</h4>
              <p className="text-gray-600 text-sm">
                Access to counselors and mental health resources
              </p>
            </div>

            {/* Community */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-brand-primary" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Support</h4>
              <p className="text-gray-600 text-sm">
                Connect with peers in safe, moderated spaces
              </p>
            </div>

            {/* Crisis Support */}
            <div className="text-center">
              <div className="w-12 h-12 bg-danger/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-danger" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Emergency Support</h4>
              <p className="text-gray-600 text-sm">
                Instant access to crisis resources and panic button
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to take control of your well-being?</h3>
        <p className="text-gray-600 mb-8">Join thousands of students finding their safe ground.</p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors"
        >
          Get Started Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>SafeGround © 2024. Your privacy is our priority.</p>
        </div>
      </footer>
    </div>
  );
}
