'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 9998,
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e0db',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 200ms',
        color: '#2c241f',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f6f5f1';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
      aria-label="Go back"
    >
      <ArrowLeft size={16} />
    </button>
  );
}
