'use client';

import { useState, useEffect } from 'react';
import { generateAlias } from '@/lib/utils/aliasGenerator';
import Link from 'next/link';

export default function GuestPage() {
  const [alias, setAlias] = useState<string>('');

  useEffect(() => {
    setAlias(generateAlias());
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold text-brand-primary mb-4">SafeGround</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {alias}</h2>

          <p className="text-gray-600 mb-8">
            You&apos;ve entered SafeGround as an anonymous visitor. Your privacy is completely protected.
          </p>

          <div className="space-y-4">
            <button className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors">
              Browse Support Resources
            </button>
            <button className="w-full py-3 bg-success text-white rounded-lg font-semibold hover:bg-green-800 transition-colors">
              Join Anonymous Chat
            </button>
            <Link
              href="/register"
              className="block w-full py-3 border-2 border-brand-primary text-brand-primary rounded-lg font-semibold hover:bg-brand-primary/10 transition-colors"
            >
              Create Full Account
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-8">
            Your alias changes each time you visit as a guest.
          </p>
        </div>
      </div>
    </div>
  );
}
